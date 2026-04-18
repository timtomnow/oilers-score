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
- Skater stats: G, A, Pts, +/-, PIM, SOG
- Goalie stats: SA, GA, SV, SV%

**Play-by-play**
- Live games show the last 5 plays inline (collapsible)
- "See all plays" opens a full play-by-play overlay for any game
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

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Your app will be live at `https://<your-username>.github.io/<repo-name>/`

## License

MIT — © 2026 timtomnow
