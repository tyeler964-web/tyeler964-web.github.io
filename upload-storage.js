/* Firefly Studios private browser file storage.
 *
 * GitHub Pages cannot write files to its repository from browser JavaScript.
 * This uses IndexedDB instead, so uploaded files persist in this browser and
 * are not added to the public GitHub repository.
 */
const FireflyFileStorage = (() => {
  const DB_NAME = 'firefly_studios_private_storage_v1';
  const STORE = 'files';
  const VERSION = 1;

  function open(){
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,VERSION);
      request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE,{keyPath:'id'});};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Could not open private storage.'));
    });
  }
  async function put(file){
    const db=await open();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put({id:crypto.randomUUID(),name:file.name,type:file.type,size:file.size,lastModified:file.lastModified,uploadedAt:new Date().toISOString(),blob:file});
      tx.oncomplete=()=>{db.close();resolve();};
      tx.onerror=()=>{db.close();reject(tx.error||new Error('Could not save file.'));};
    });
  }
  async function getAll(){
    const db=await open();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readonly'); const req=tx.objectStore(STORE).getAll();
      req.onsuccess=()=>{db.close();resolve(req.result||[]);};
      req.onerror=()=>{db.close();reject(req.error||new Error('Could not read private storage.'));};
    });
  }
  async function remove(id){
    const db=await open();
    return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});
  }
  async function clear(){
    const db=await open();
    return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});
  }
  return {put,getAll,remove,clear};
})();
