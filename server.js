import express from 'express';import cors from 'cors';import {WebSocketServer} from 'ws';import http from 'http';
const app=express();app.use(cors());app.use(express.json({limit:'256kb'}));
const rooms=new Map();const started=Date.now();
app.get('/api/health',(req,res)=>res.json({ok:true,service:'PaperLive API',version:'2.0.0',uptime:Math.round((Date.now()-started)/1000)}));
app.get('/api/status',(req,res)=>res.json({server:{name:process.env.SERVER_NAME||'PaperLive Demo Bridge',version:'2.0.0'},onlinePlayers:0,bedrockPlayers:0,players:[],plugin:{name:'PaperLive Bridge',version:'2.0.0'},capabilities:['status','chat-signaling','voice-signaling','webrtc-mesh','client-capabilities']}));
app.get('/api/rooms',(req,res)=>res.json({rooms:[...rooms.entries()].map(([id,set])=>({id,users:set.size,limit:10}))}));
app.post('/api/chat',(req,res)=>{const text=typeof req.body?.text==='string'?req.body.text.trim().slice(0,500):'';if(!text)return res.status(400).json({error:'message required'});res.json({ok:true,message:{text,createdAt:new Date().toISOString()}})});
const server=http.createServer(app);const wss=new WebSocketServer({server,path:'/ws'});
function send(ws,obj){if(ws.readyState===1)ws.send(JSON.stringify(obj))}function broadcast(room,obj,except){for(const ws of room||[]){if(ws!==except)send(ws,obj)}}
wss.on('connection',(ws)=>{let roomId=null;const userId=Math.random().toString(36).slice(2,10);ws.userId=userId;ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}
if(m.type==='join'){const id=String(m.room||'lobby').slice(0,40);let room=rooms.get(id);if(!room){room=new Set();rooms.set(id)}if(room.size>=10){send(ws,{type:'error',code:'ROOM_FULL',message:'This voice room is full (10 users maximum).'});return}roomId=id;const existing=[...room].map(peer=>peer.userId);room.add(ws);ws.roomId=id;send(ws,{type:'joined',room:id,userId,users:room.size,existing});broadcast(room,{type:'user-joined',userId,users:room.size},ws)}
else if(m.type==='signal'&&roomId){const target=[...(rooms.get(roomId)||[])].find(peer=>peer.userId===m.to);if(target)send(target,{type:'signal',from:userId,data:m.data})}
else if(m.type==='chat'&&roomId){broadcast(rooms.get(roomId),{type:'chat',from:userId,text:String(m.text||'').slice(0,500),createdAt:new Date().toISOString()})}
});ws.on('close',()=>{const room=rooms.get(roomId);if(room){room.delete(ws);broadcast(room,{type:'user-left',userId,users:room.size});if(!room.size)rooms.delete(roomId)}})});
const port=Number(process.env.PORT||10000);server.listen(port,'0.0.0.0',()=>console.log(`PaperLive API listening on ${port}`));