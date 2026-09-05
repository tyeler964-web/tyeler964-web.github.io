const $ = id => document.getElementById(id);
const savedUrl = localStorage.getItem('paperlive_api_url');
if (savedUrl) $('apiUrl').value = savedUrl;
$('menuButton').addEventListener('click', () => $('nav').classList.toggle('open'));
$('clearButton').addEventListener('click', () => { localStorage.removeItem('paperlive_api_url'); $('apiUrl').value=''; $('apiKey').value=''; setStatus('Cleared.'); });
$('connectButton').addEventListener('click', connect);
function setStatus(text, error=false){ $('connectStatus').textContent=text; $('connectStatus').style.color=error?'var(--danger)':'var(--muted)'; }
function setText(id,value){ $(id).textContent = value ?? '—'; }
async function connect(){
  const base = $('apiUrl').value.trim().replace(/\/$/,'');
  if(!base){ setStatus('Enter a PaperLive API URL first.',true); return; }
  localStorage.setItem('paperlive_api_url',base); setStatus('Connecting…');
  const headers={}; const key=$('apiKey').value.trim(); if(key) headers.Authorization=`Bearer ${key}`;
  try{
    const res=await fetch(base,{headers,cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data=await res.json(); render(data); setStatus('Connected.'); $('lastUpdated').textContent=`Updated ${new Date().toLocaleTimeString()}`;
  }catch(err){ setStatus(`Could not connect: ${err.message}. Check the URL, server API, and CORS settings.`,true); }
}
function render(data){
  setText('serverName',data.server?.name ?? data.serverName ?? data.name);
  const players=data.players ?? [];
  setText('playerCount',data.onlinePlayers ?? data.playerCount ?? players.length);
  setText('bedrockCount',data.bedrockPlayers ?? players.filter(p=>String(p.platform||'').toLowerCase().includes('bedrock')).length);
  setText('pluginStatus',data.plugin?.version ? `Online v${data.plugin.version}` : (data.pluginStatus ?? 'Online'));
  $('playersBody').innerHTML=players.length?players.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.platform)}</td><td>${esc(p.device)}</td><td>${esc(p.language)}</td><td>${esc(p.protocol)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">No players online.</td></tr>';
}
function esc(v){return String(v??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
