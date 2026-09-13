# FBS Studios

FBS Studios is a browser-based streaming production studio hosted on GitHub Pages, with an optional Render backend for OAuth, live-platform setup and FFmpeg relay.

## Included
- OBS-style scenes and source list
- Camera and screen-share capture
- Display-audio capture when the browser exposes a display audio track
- Microphone mixer UI
- Unified YouTube + Twitch chat overlay architecture
- Collab-camera source placeholder for guest workflows
- Overlay editor and scene transitions
- Keybinds: F5 stream, F6 record, Ctrl+1/2/3 scenes
- YouTube and Twitch OAuth entry points
- Backend WebSocket media relay using FFmpeg

## Important deployment note
GitHub Pages can host the frontend but cannot safely run the streaming backend or hold OAuth client secrets. The included Render configuration deploys the backend separately. Set the backend URL in **Settings** in FBS Studios.

Configure these Render environment variables on the backend:
`PUBLIC_API_URL`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`.

Register OAuth redirect URLs as:
- `https://YOUR-BACKEND-DOMAIN/auth/youtube/callback`
- `https://YOUR-BACKEND-DOMAIN/auth/twitch/callback`

Do not put client secrets, stream keys, or passwords in GitHub Pages source code.
