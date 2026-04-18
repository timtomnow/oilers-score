# Oilers Score

A lightweight web app for tracking the Edmonton Oilers — live score, period situation, standings, and more. Installable as a home screen app on Android and iPhone.

## Features

**Game tracking**
- Live score with period indicator (1st / 2nd / 3rd / OT / SO)
- Period clock — time remaining or intermission
- Shots on goal per team during live games
- Period-by-period line score with totals
- Probable starters (scheduled games)
- Goalie decisions (final games)
- TV broadcast listings
- Handles off days

**Player stats**
- Collapsible player stats section for any live or completed game
- Toggle between away and home team
- Jersey number displayed beside each player name
- Skater stats: G, A, Pts, +/-, PIM, SOG
- Goalie stats: SA, GA, SV, SV%

**Play-by-play**
- Live games show the last 5 plays inline (collapsible)
- "See all plays" opens a full play-by-play overlay for any game
- Each play shows the team abbreviation and is colour-coded by team (away in blue, home in orange)
- Filter plays by type: All, Goals, Penalties, Shots
- Multi-select period filter to focus on specific periods

**Season context**
- Season record (W-L-OT), winning %, and current streak
- Full Pacific Division standings with points, games back, and streak
- Last 5 completed games (W/L/OTL, score, opponent) — each clickable for full game stats and play-by-play
- Next 3 upcoming scheduled games with date and time

**Auto-refresh**
- Every 30 seconds during live games
- Every 60 seconds when a game is scheduled (to catch puck drop)
- Every 5 minutes on off days

## In-app help

A **?** icon in the app footer loads this README file directly from GitHub, so any updates to the docs are always reflected in the app without a redeploy.

## Install on your phone

On **Android** (Chrome): visit the site and tap the "Add to Home Screen" banner that appears at the bottom of the screen.

On **iPhone** (Safari): tap the Share button → "Add to Home Screen".

The app installs with a custom icon and opens full-screen without a browser address bar.

## How it works

Fetches data from the free [NHL API](https://api-web.nhle.com) — no API key, backend, or build step required. Open `index.html` directly in any browser, or host it as a static site.

Because browsers block cross-origin requests to the NHL API, the app routes requests through a small Cloudflare Worker that adds the necessary CORS headers. The worker code is in [`worker/index.js`](worker/index.js).

## Configuration

All deployment-specific values live in [`config.js`](config.js) at the repo root:

```js
const CONFIG = {
  NHL_API_BASE:    'https://your-worker.workers.dev',  // Cloudflare Worker URL
  TEAM_ABBREV:     'EDM',   // NHL team abbreviation
  TEAM_ID:         22,      // NHL team ID
  DIVISION_ABBREV: 'P',     // Division abbreviation (for standings filter)
};
```

Update `NHL_API_BASE` to point to your own deployed Worker before publishing. The team fields only need changing if you fork this for a different team.

## Deploy the Cloudflare Worker

The Worker acts as a CORS proxy so the browser can reach the NHL API.

**Prerequisites:** A free [Cloudflare account](https://dash.cloudflare.com/sign-up) and [Node.js](https://nodejs.org) installed.

1. Install Wrangler:
   ```sh
   npm install -g wrangler
   wrangler login
   ```

2. Create the KV namespace used for rate limiting:
   ```sh
   cd worker
   npx wrangler kv namespace create RATE_KV
   ```
   Copy the returned `id` value and paste it into `worker/wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "RATE_KV"
   id = "paste-your-id-here"
   ```

3. Deploy the Worker:
   ```sh
   npx wrangler deploy
   ```
   Wrangler will print the Worker URL — copy it into `config.js` as `NHL_API_BASE`.

4. Optionally adjust the daily request cap in `worker/wrangler.toml`:
   ```toml
   [vars]
   DAILY_CAP = "50000"   # Cloudflare free tier allows 100,000/day
   ```

## Deploy to GitHub Pages

1. Set `NHL_API_BASE` in [`config.js`](config.js) to your Worker URL
2. Push this repo to GitHub
3. Go to **Settings → Pages**
4. Set source to `main` branch, `/ (root)`
5. Your app will be live at `https://<your-username>.github.io/<repo-name>/`

## License

MIT — © 2026 timtomnow
