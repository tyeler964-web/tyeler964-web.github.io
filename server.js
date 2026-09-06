import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

const API_KEY = String(process.env.PAPERLIVE_API_KEY || '').trim();
const rooms = new Map();
const started = Date.now();

function authorized(req) {
  if (!API_KEY) return true;
  const value = String(req.headers.authorization || '');
  return value === `Bearer ${API_KEY}`;
}

function requireApiKey(req, res, next) {
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/health', (req, res) => res.json({
  ok: true,
  service: 'PaperLive API',
  version: '2.1.0',
  uptime: Math.round((Date.now() - started) / 1000),
  authentication: API_KEY ? 'required' : 'disabled'
}));

app.get('/api/status', requireApiKey, (req, res) => res.json({
  server: { name: process.env.SERVER_NAME || 'PaperLive Demo Bridge', version: '2.1.0' },
  onlinePlayers: 0,
  bedrockPlayers: 0,
  players: [],
  plugin: { name: 'PaperLive Bridge', version: '2.1.0' },
  capabilities: ['status', 'chat-signaling', 'voice-signaling', 'webrtc-mesh', 'client-capabilities']
}));

app.get('/api/rooms', requireApiKey, (req, res) => res.json({
  rooms: [...rooms.entries()].map(([id, set]) => ({ id, users: set.size, limit: 10 }))
}));

app.post('/api/chat', requireApiKey, (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim().slice(0, 500) : '';
  if (!text) return res.status(400).json({ error: 'message required' });
  res.json({ ok: true, message: { text, createdAt: new Date().toISOString() } });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function send(ws, obj) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

function broadcast(room, obj, except) {
  for (const ws of room || []) if (ws !== except) send(ws, obj);
}

wss.on('connection', (ws, req) => {
  let roomId = null;
  let authenticated = !API_KEY;
  let joined = false;
  const userId = Math.random().toString(36).slice(2, 10);
  ws.userId = userId;

  ws.on('message', raw => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }

    if (m.type === 'auth') {
      if (!API_KEY || String(m.key || '') === API_KEY) {
        authenticated = true;
        send(ws, { type: 'authenticated' });
      } else {
        send(ws, { type: 'error', code: 'UNAUTHORIZED', message: 'Invalid PaperLive API key.' });
        ws.close(1008, 'Unauthorized');
      }
      return;
    }

    if (!authenticated) {
      send(ws, { type: 'error', code: 'UNAUTHORIZED', message: 'Authenticate before joining.' });
      return;
    }

    if (m.type === 'join') {
      if (joined) return;
      const id = String(m.room || 'lobby').slice(0, 40);
      let room = rooms.get(id);
      if (!room) { room = new Set(); rooms.set(id, room); }
      if (room.size >= 10) {
        send(ws, { type: 'error', code: 'ROOM_FULL', message: 'This voice room is full (10 users maximum).' });
        return;
      }
      roomId = id;
      joined = true;
      const existing = [...room].map(peer => peer.userId);
      room.add(ws);
      ws.roomId = id;
      send(ws, { type: 'joined', room: id, userId, users: room.size, existing });
      broadcast(room, { type: 'user-joined', userId, users: room.size }, ws);
    } else if (m.type === 'signal' && roomId) {
      const target = [...(rooms.get(roomId) || [])].find(peer => peer.userId === m.to);
      if (target) send(target, { type: 'signal', from: userId, data: m.data });
    } else if (m.type === 'chat' && roomId) {
      const text = String(m.text || '').trim().slice(0, 500);
      if (!text) return;
      broadcast(rooms.get(roomId), { type: 'chat', from: userId, text, createdAt: new Date().toISOString() });
    }
  });

  ws.on('close', () => {
    const room = rooms.get(roomId);
    if (room) {
      room.delete(ws);
      broadcast(room, { type: 'user-left', userId, users: room.size });
      if (!room.size) rooms.delete(roomId);
    }
  });
});

const port = Number(process.env.PORT || 10000);
server.listen(port, '0.0.0.0', () => console.log(`PaperLive API listening on ${port}`));
