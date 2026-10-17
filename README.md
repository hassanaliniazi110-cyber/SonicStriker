# SonicStriker ⚽

A dark, lime-green football-game starter inspired by the visual style requested for ECLIPSE ARENA. SonicStriker is a separate project and does not modify the original repository.

## Files
- `index.html` — dashboard, match screen, squad builder, career, online server panel, and YouTube Area.
- `style.css` — responsive dark/lime visual theme.
- `script.js` — local prototype gameplay, keyboard/touch movement, optional browser speech recognition, sample player market, local career progression, backend health check, and YouTube embed UI.
- `server.js` — optional starter Express backend with health and simple in-memory room endpoints.
- `package.json` — backend dependencies and start script.

## Run the website
Open `index.html` in a browser or enable GitHub Pages for this repository (Settings → Pages → deploy from `main` / root). The static site does not run the Node server.

## Run the optional backend
Install Node.js, then run:
```sh
npm install
npm start
```
The server defaults to port 3000. Set `ALLOWED_ORIGINS` to a comma-separated list of trusted website origins when deploying.

## Important prototype limits
- Match gameplay is a small canvas prototype, not a full 3D engine or realistic licensed football simulation.
- Voice recognition depends on browser support, microphone permission, and often HTTPS.
- Squad, coins, and career stats are stored in this browser's local storage; they are not secure accounts or cloud saves.
- The server provides a health endpoint and basic in-memory room scaffolding. It is not production matchmaking or a complete synchronized multiplayer engine.
- YouTube videos can only be embedded when the publisher permits embedding. The original ECLIPSE ARENA's private YouTube access approval system, authentication, and existing server features are **not automatically copied or connected**. They must be implemented and tested separately before treating them as secure or live.
- Sample player cards are fictional placeholders and are not official player licenses.

## Deploying
GitHub Pages can host the frontend only. Deploy `server.js` separately to a Node hosting service if you need the API. Never put passwords, API keys, or private server secrets in frontend files.


## Full backend features ported from ECLIPSE ARENA

The SonicStriker `server.js` now includes authenticated player registration, profiles, friends, invites, Socket.IO friend presence and match-state relay, rate limits, security headers, and server-verified YouTube request/owner approval endpoints. Its persistent files use SonicStriker-specific names so it does not intentionally share account/access data with ECLIPSE ARENA.

### Configure the backend
1. Deploy this repository's Node backend separately from GitHub Pages (GitHub Pages only serves static files).
2. Set `ALLOWED_ORIGINS=https://hassanaliniazi110-cyber.github.io` in the hosting provider.
3. Register the owner account in SonicStriker and set `YOUTUBE_ADMIN_PLAYER_ID` to that new SonicStriker player ID. Do not assume the ECLIPSE ARENA player ID is the same.
4. Set the deployed backend's HTTPS URL in `config.js` under `backendUrl`.
5. Use persistent storage on the backend host for `sonicstriker-data.json` and `sonicstriker-youtube-access.json`. Without persistent storage, local data may be lost when the host restarts.

Copy environment variable names from `.env.example` into the hosting dashboard. Do not copy or commit ECLIPSE ARENA's actual `.env` file or any real secrets. The current SonicStriker frontend still needs its account/friends/Socket.IO UI wired to these endpoints before the full backend features are accessible from the game UI.
