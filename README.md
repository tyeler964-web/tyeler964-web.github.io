# Firefly Studios / PaperLive

Firefly Studios — PaperLive, plugins, addons, and Minecraft Bedrock & Java tools.

## PaperLive Bedrock Client

Open `client.html` for the new device-aware PaperLive Bedrock Client interface. It includes:

- Server bridge connection and live player status
- Realtime WebSocket signaling
- Browser WebRTC microphone controls
- 10-user voice-room limit enforced by the API
- Chat room signaling
- `.mcpack`, `.mcworld`, `.mcaddon`, `.mctemplate`, and ZIP file inspection/import UI
- Device/browser capability detection
- Network, memory, CPU, display, and API latency diagnostics
- Local server profile/settings storage
- Service-worker caching for supported browsers
- Clear separation between browser capabilities and Minecraft-side bridge functionality

The browser client does not silently access another application's protected files. Minecraft-side control still requires an appropriate PaperLive/Minecraft bridge.

## Render

This repository's `render.yaml` defines two Render services:

1. `firefly-studios` — the public static frontend.
2. `paperlive-api` — the Node.js realtime API and WebSocket signaling service.

The API exposes `/api/health`, `/api/status`, `/api/rooms`, `/api/chat`, and `/ws`.

Both services use the `main` branch with automatic deploys on commits. Render's documentation confirms that linked services can automatically rebuild and redeploy when changes are pushed to the configured branch.

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tyeler964-web/tyeler964-web.github.io)

Click the button, sign in to Render if needed, review the Blueprint, and approve the deployment. The Render account authorization/approval must be completed by the account owner.

## Architecture

```text
Browser
  ├─ Firefly static frontend
  └─ PaperLive Bedrock Client
        ├─ REST → paperlive-api
        ├─ WebSocket → paperlive-api
        └─ WebRTC microphone → browser permissions

Minecraft server
  └─ PaperLive/Minecraft-side bridge → paperlive-api
```
