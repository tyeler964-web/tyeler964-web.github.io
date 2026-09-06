(() => {
  const root = document.documentElement;
  const results = {
    microphone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    notifications: 'Notification' in window,
    backgroundSync: 'serviceWorker' in navigator && ('SyncManager' in window || 'periodicSync' in (ServiceWorkerRegistration?.prototype || {})),
    storage: !!(window.localStorage && window.indexedDB),
    clipboard: !!navigator.clipboard,
    websocket: 'WebSocket' in window,
  };

  window.FireflyCapabilities = results;
  root.dataset.microphone = String(results.microphone);
  root.dataset.notifications = String(results.notifications);
  root.dataset.backgroundSync = String(results.backgroundSync);

  const panel = document.getElementById('deviceCapabilities');
  if (!panel) return;

  const items = [
    ['Voice / microphone', results.microphone],
    ['Notifications', results.notifications],
    ['Background sync', results.backgroundSync],
    ['Local app storage', results.storage],
    ['Live connections', results.websocket],
  ];

  panel.innerHTML = items.map(([name, supported]) =>
    `<div class="capability"><span>${name}</span><strong class="capability-${supported ? 'yes' : 'no'}">${supported ? 'Available' : 'Not available on this device'}</strong></div>`
  ).join('');
})();
