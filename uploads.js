document.addEventListener('DOMContentLoaded',()=>{
  const input=document.getElementById('fileUploadInput');
  const button=document.getElementById('uploadButton');
  const status=document.getElementById('uploadStatus');
  const list=document.getElementById('uploadedFiles');
  if(!input||!button||!status||!list||!window.FireflyFileStorage)return;

  const formatSize=bytes=>{if(bytes<1024)return `${bytes} B`;if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/1024/1024).toFixed(1)} MB`;};
  const render=async()=>{
    const files=await FireflyFileStorage.getAll(); list.innerHTML='';
    if(!files.length){list.innerHTML='<p class="empty">No files saved in this browser.</p>';return;}
    files.sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt)).forEach(item=>{
      const row=document.createElement('div');row.className='saved-server';
      const info=document.createElement('div');info.className='saved-server-info';
      const title=document.createElement('strong');title.textContent=item.name;
      const details=document.createElement('span');details.textContent=`${formatSize(item.size)} • ${item.type||'Unknown type'}`;info.append(title,details);
      const actions=document.createElement('div');actions.className='saved-server-actions';
      const open=document.createElement('button');open.className='button secondary';open.type='button';open.textContent='Open';
      open.addEventListener('click',()=>{const url=URL.createObjectURL(item.blob);window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),60000);});
      const remove=document.createElement('button');remove.className='button danger-button';remove.type='button';remove.textContent='Delete';
      remove.addEventListener('click',async()=>{await FireflyFileStorage.remove(item.id);await render();});
      actions.append(open,remove);row.append(info,actions);list.appendChild(row);
    });
  };
  button.addEventListener('click',()=>input.click());
  input.addEventListener('change',async()=>{
    const files=Array.from(input.files||[]);if(!files.length)return;
    status.textContent=`Saving ${files.length} file${files.length===1?'':'s'}…`;button.disabled=true;
    try{for(const file of files)await FireflyFileStorage.put(file);status.textContent=`Saved ${files.length} file${files.length===1?'':'s'} in this browser.`;await render();}
    catch(error){status.textContent=`Upload failed: ${error instanceof Error?error.message:String(error)}`;status.style.color='var(--danger)';}
    finally{button.disabled=false;input.value='';}
  });
  document.getElementById('clearUploadedFilesButton')?.addEventListener('click',async()=>{await FireflyFileStorage.clear();status.textContent='Private browser files cleared.';status.style.color='var(--muted)';await render();});
  render().catch(()=>{status.textContent='Private file storage is unavailable in this browser.';status.style.color='var(--danger)';});
});
