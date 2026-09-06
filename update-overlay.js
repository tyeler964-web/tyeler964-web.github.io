(() => {
  const UPDATE_URL = '/update.json?cache=' + Date.now();
  const SEEN_KEY = 'firefly_seen_update_id';
  let firstCheck = true;
  function showUpdate(message) {
    if (document.getElementById('siteUpdateOverlay')) return;
    const overlay=document.createElement('div'); overlay.id='siteUpdateOverlay';
    overlay.innerHTML='<div class="site-update-card"><div class="site-update-spinner" aria-hidden="true"></div><h2></h2><p>Please wait while the latest version becomes available.</p></div>';
    overlay.querySelector('h2').textContent=message||'The Site Is Updating';
    Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'99999',display:'grid',placeItems:'center',background:'rgba(255,255,255,.96)',opacity:'0',transition:'opacity .35s ease'});
    Object.assign(overlay.querySelector('.site-update-card').style,{textAlign:'center',fontFamily:'system-ui,sans-serif',padding:'34px',maxWidth:'460px',color:'#111827'});
    Object.assign(overlay.querySelector('.site-update-spinner').style,{width:'42px',height:'42px',margin:'0 auto 18px',border:'4px solid #e5e7eb',borderTopColor:'#111827',borderRadius:'50%',animation:'fireflyUpdateSpin .8s linear infinite'});
    const style=document.createElement('style'); style.textContent='@keyframes fireflyUpdateSpin{to{transform:rotate(360deg)}}'; document.head.appendChild(style);
    document.body.appendChild(overlay); requestAnimationFrame(()=>overlay.style.opacity='1');
  }
  async function check(){try{const r=await fetch(UPDATE_URL,{cache:'no-store'});if(!r.ok)return;const d=await r.json();if(!d.updateId)return;const seen=localStorage.getItem(SEEN_KEY);if(firstCheck){if(seen&&seen!==d.updateId)showUpdate(d.message);localStorage.setItem(SEEN_KEY,d.updateId);firstCheck=false;}else if(seen!==d.updateId){localStorage.setItem(SEEN_KEY,d.updateId);showUpdate(d.message);setTimeout(()=>location.reload(),1800);}}catch{}}
  check(); setInterval(check,10000);
})();

