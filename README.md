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
