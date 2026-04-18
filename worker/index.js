/**
 * Oilers Score — NHL API CORS Proxy
 *
 * Cloudflare Worker that proxies api-web.nhle.com, adds CORS headers,
 * caches responses at the edge, and enforces a daily request cap using
 * Workers KV so the free tier (100k req/day) is never breached.
 *
 * KV namespace binding required: RATE_KV  (see wrangler.toml)
 * Environment variable:  DAILY_CAP  (default 50000 — set in dashboard or wrangler.toml)
 */

const NHL_BASE = 'https://api-web.nhle.com';

// Cache TTLs (seconds) by URL pattern — live data short, static data longer
function cacheTTL(pathname) {
  if (/\/gamecenter\/\d+\/(play-by-play|boxscore)/.test(pathname)) return 20;
  if (/\/schedule\//.test(pathname))      return 30;
  if (/\/standings/.test(pathname))       return 300;  // 5 min
  if (/\/club-schedule/.test(pathname))   return 300;  // 5 min
  return 60;
}

// Pad a date part to 2 digits
const p2 = n => String(n).padStart(2, '0');

// Key for today's KV counter — resets each UTC day automatically via expirationTtl
function todayKey() {
  const d = new Date();
  return `req:${d.getUTCFullYear()}-${p2(d.getUTCMonth()+1)}-${p2(d.getUTCDate())}`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health / root
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(JSON.stringify({ status: 'ok', service: 'oilers-score-proxy' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only proxy GET requests
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // ── Daily cap check (only on cache misses — see below) ──────────────────
    //   We check the counter BEFORE hitting the upstream, not for cache hits.
    //   KV.get returns null if key doesn't exist yet.

    const dailyCap = parseInt(env.DAILY_CAP ?? '50000', 10);
    const key = todayKey();

    // ── Edge cache lookup ────────────────────────────────────────────────────
    const nhlUrl = `${NHL_BASE}${url.pathname}${url.search}`;
    const cacheKey = new Request(nhlUrl, { method: 'GET' });
    const cache = caches.default;

    const cached = await cache.match(cacheKey);
    if (cached) {
      // Serve from edge cache — does NOT count as a Worker invocation for billing,
      // and does NOT decrement our daily cap.
      const res = new Response(cached.body, cached);
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('X-Cache', 'HIT');
      return res;
    }

    // Cache miss — check daily cap before going upstream
    let currentCount = 0;
    if (env.RATE_KV) {
      const raw = await env.RATE_KV.get(key);
      currentCount = raw ? parseInt(raw, 10) : 0;
      if (currentCount >= dailyCap) {
        return new Response(
          JSON.stringify({ error: 'Daily request limit reached. Try again tomorrow.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Retry-After': '3600',
            },
          }
        );
      }
    }

    // ── Fetch from NHL API ───────────────────────────────────────────────────
    let nhlRes;
    try {
      nhlRes = await fetch(nhlUrl, {
        headers: { Accept: 'application/json', 'User-Agent': 'oilers-score/1.0' },
        redirect: 'follow',
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: `Upstream fetch failed: ${err.message}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!nhlRes.ok) {
      return new Response(JSON.stringify({ error: `NHL API returned ${nhlRes.status}` }), {
        status: nhlRes.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // ── Increment daily counter (background, non-blocking) ──────────────────
    if (env.RATE_KV) {
      ctx.waitUntil(
        env.RATE_KV.put(key, String(currentCount + 1), { expirationTtl: 86400 })
      );
    }

    // ── Build cacheable response ─────────────────────────────────────────────
    const ttl = cacheTTL(url.pathname);
    const body = await nhlRes.text();

    const response = new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}`,
        'Access-Control-Allow-Origin': '*',
        'X-Cache': 'MISS',
        'X-Cache-TTL': String(ttl),
      },
    });

    // Store in edge cache (background — don't block the response)
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
