# PaperLive deployment

PaperLive is split into two Render services:

- `firefly-studios` — static Firefly Studios / PaperLive frontend.
- `paperlive-api` — Node/Express API plus WebSocket signaling for voice and chat.

The root `render.yaml` manages both services. Render supports `runtime: static` for static sites and `runtime: node` for Node web services, and `autoDeployTrigger: commit` deploys linked-branch commits automatically. See the Render Blueprint documentation for the current schema.

## Render setup

1. Connect `tyeler964-web/tyeler964-web.github.io` to Render.
2. Create/sync the Blueprint from the root `render.yaml`.
3. Keep the frontend and API services on the `main` branch.
4. Set the `PAPERLIVE_API_KEY` secret for `paperlive-api` if authentication is wanted. The value is intentionally marked `sync: false` so the secret is supplied in Render rather than committed to Git.
5. In the PaperLive client, enter the API service URL and the same API key.

The API health endpoint is `/api/health`. It intentionally remains public so Render can use it for health checks. Protected API routes return HTTP 401 when `PAPERLIVE_API_KEY` is configured.

## Security notes

- Never commit API keys, Microsoft/Xbox tokens, passwords, or other credentials.
- The client stores only the user-entered PaperLive API key in memory for the current page session; it does not write the key to localStorage.
- WebSocket clients must authenticate before joining a room when an API key is configured.
- Voice uses browser WebRTC. The server handles signaling; voice media is peer-to-peer between participating browsers.
- The current bridge status is a demo/API contract. A real Minecraft-side bridge still needs to implement the same `/api/status` contract and any future server-control endpoints.

## Deployment checks

GitHub Actions validates `server.js`, `client.js`, and `sw.js` with Node 20 on pushes and pull requests to `main`.

Render's free web services can spin down after inactivity, so the realtime API should not be treated as a guaranteed always-on service on the free plan.
