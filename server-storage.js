/* PaperLive browser storage helper.
 *
 * GitHub Pages is static, so this file stores connection profiles locally in
 * the visitor's browser rather than committing secrets to GitHub.
 * API keys are stored in localStorage and should only be used for servers
 * where the user is comfortable keeping the key in their browser.
 */
const PaperLiveStorage = (() => {
  const KEY = 'paperlive_server_profiles_v1';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }

  function save(profile) {
    const profiles = getAll().filter(p => p.id !== profile.id);
    const item = {
      id: profile.id || crypto.randomUUID(),
      name: profile.name || 'My Server',
      ip: profile.ip || '',
      port: String(profile.port || ''),
      apiPort: String(profile.apiPort || ''),
      apiKey: profile.apiKey || '',
      updatedAt: new Date().toISOString()
    };
    profiles.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(profiles));
    return item;
  }

  function remove(id) {
    localStorage.setItem(KEY, JSON.stringify(getAll().filter(p => p.id !== id)));
  }

  function clear() { localStorage.removeItem(KEY); }

  return { getAll, save, remove, clear };
})();
