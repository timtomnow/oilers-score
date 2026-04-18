// Public configuration — edit these values to match your deployment.
// See README.md for setup instructions.

const CONFIG = {
  // Your deployed Cloudflare Worker URL (CORS proxy for the NHL API).
  // Set to 'https://api-web.nhle.com' to bypass the proxy (browser CORS will block this).
  NHL_API_BASE: 'https://oilers-score-proxy.oilers-score-proxy.workers.dev',

  // NHL team identifiers — change these if you fork for a different team.
  TEAM_ABBREV:     'EDM',
  TEAM_ID:         22,
  DIVISION_ABBREV: 'P',
};
