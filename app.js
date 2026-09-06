const $ = id => document.getElementById(id);

const menuButton = $('menuButton');
const nav = $('nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

const apiUrl = $('apiUrl');
const apiKey = $('apiKey');
const connectButton = $('connectButton');
const clearButton = $('clearButton');

function setStatus(text, error=false){
  const el = $('connectStatus');
  if (!el) return;
  el.textContent = text;
  el.style.color = error ? 'var(--danger)' : 'var(--muted)';
}
function setText(id,value){ const el=$(id); if(el) el.textContent = value ?? '—'; }
function normalizeUrl(value){
  try{
    const url = new URL(String(value||'').trim());
    if(!['http:','https:'].includes(url.protocol)) return '';
    return url.toString().replace(/\/$/,'');
  }catch{return '';}
}
function buildApiUrl(ip, port){
  const host=String(ip||'').trim(); const p=String(port||'').trim();
  if(!host) return '';
  if(/^https?:\/\//i.test(host)) return normalizeUrl(host);
  const h=host.includes(':')&&!host.startsWith('[')?`[${host}]`:host;
  return normalizeUrl(`http://${h}${p?`:${p}`:''}`);
}

function renderSavedServers(){
  const list=$('savedServers');
  if(!list || !window.PaperLiveStorage) return;
  const profiles=window.PaperLiveStorage.getAll();
  list.innerHTML='';
  if(!profiles.length){ list.innerHTML='<p class="empty">No saved servers yet.</p>'; return; }
  profiles.forEach(profile=>{
    const row=document.createElement('div'); row.className='saved-server';
    const info=document.createElement('div'); info.className='saved-server-info';
    const title=document.createElement('strong'); title.textContent=profile.name||'My Server';
    const details=document.createElement('span'); details.textContent=`${profile.ip||'No IP'}${profile.apiPort?`:${profile.apiPort}`:''}`;
    info.append(title,details);
    const actions=document.createElement('div'); actions.className='saved-server-actions';
    const load=document.createElement('button'); load.className='button secondary'; load.type='button'; load.textContent='Load';
    load.addEventListener('click',()=>{
      if($('serverNameInput')) $('serverNameInput').value=profile.name||'';
      if($('serverIp')) $('serverIp').value=profile.ip||'';
      if($('serverPort')) $('serverPort').value=profile.port||'';
      if($('serverApiPort')) $('serverApiPort').value=profile.apiPort||'';
      if(apiKey) apiKey.value=profile.apiKey||'';
      if(apiUrl) apiUrl.value=profile.apiUrl||buildApiUrl(profile.ip,profile.apiPort);
    });
    const remove=document.createElement('button'); remove.className='button danger-button'; remove.type='button'; remove.textContent='Delete';
    remove.addEventListener('click',()=>{window.PaperLiveStorage.remove(profile.id);renderSavedServers();});
    actions.append(load,remove); row.append(info,actions); list.appendChild(row);
  });
}

function saveCurrentServer(){
  if(!window.PaperLiveStorage) return;
  const ip=$('serverIp')?.value.trim()||'';
  const url=normalizeUrl(apiUrl?.value)||buildApiUrl(ip,$('serverApiPort')?.value);
  if(!ip&&!url){setStatus('Enter an IP/hostname or Web API URL before saving.',true);return;}
  window.PaperLiveStorage.save({
    name:$('serverNameInput')?.value.trim()||'My Server', ip,
    port:$('serverPort')?.value.trim()||'', apiPort:$('serverApiPort')?.value.trim()||'',
    apiKey:apiKey?.value.trim()||'', apiUrl:url
  });
  renderSavedServers(); setStatus('Server saved in this browser.');
}

async function connect(){
  const base=normalizeUrl(apiUrl?.value)||buildApiUrl($('serverIp')?.value,$('serverApiPort')?.value);
  if(!base){setStatus('Enter a valid HTTP(S) API URL or IP/hostname and API port first.',true);return;}
  if(apiUrl) apiUrl.value=base;
  setStatus('Connecting…'); if(connectButton) connectButton.disabled=true;
  const headers={}; const key=apiKey?.value.trim(); if(key) headers.Authorization=`Bearer ${key}`;
  try{
    const res=await fetch(base,{headers,cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data=await res.json(); render(data); setStatus('Connected.');
    setText('lastUpdated',`Updated ${new Date().toLocaleTimeString()}`);
    localStorage.setItem('paperlive_api_url',base);
  }catch(err){setStatus(`Could not connect: ${err instanceof Error?err.message:String(err)}. Check the URL, API, HTTPS/CORS settings, and API key.`,true);}
  finally{if(connectButton) connectButton.disabled=false;}
}

function render(data){
  if(!data||typeof data!=='object'){setStatus('The API returned invalid JSON data.',true);return;}
  setText('serverName',data.server?.name??data.serverName??data.name);
  const players=Array.isArray(data.players)?data.players:[];
  setText('playerCount',data.onlinePlayers??data.playerCount??players.length);
  setText('bedrockCount',data.bedrockPlayers??players.filter(p=>String(p?.platform||'').toLowerCase().includes('bedrock')).length);
  setText('pluginStatus',data.plugin?.version?`Online v${data.plugin.version}`:(data.pluginStatus??'Online'));
  const body=$('playersBody'); if(!body)return;
  body.innerHTML=players.length?players.map(p=>`<tr><td>${esc(p?.name)}</td><td>${esc(p?.platform)}</td><td>${esc(p?.device)}</td><td>${esc(p?.language)}</td><td>${esc(p?.protocol)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">No players online.</td></tr>';
}
function esc(v){return String(v??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clearDashboard(){
  localStorage.removeItem('paperlive_api_url');
  if(apiUrl)apiUrl.value=''; if(apiKey)apiKey.value='';
  ['serverName','playerCount','bedrockCount','pluginStatus'].forEach(id=>setText(id,'—'));
  const body=$('playersBody'); if(body)body.innerHTML='<tr><td colspan="5" class="empty">Connect to a PaperLive API to load players.</td></tr>';
  setText('lastUpdated','Waiting for data'); setStatus('Cleared.');
}

if(apiUrl&&apiKey&&connectButton&&clearButton){
  const saved=normalizeUrl(localStorage.getItem('paperlive_api_url')); if(saved)apiUrl.value=saved;
  connectButton.addEventListener('click',connect); clearButton.addEventListener('click',clearDashboard);
  $('saveServerButton')?.addEventListener('click',saveCurrentServer);
  $('clearSavedServersButton')?.addEventListener('click',()=>{window.PaperLiveStorage?.clear?.();renderSavedServers();});
  renderSavedServers();
}

