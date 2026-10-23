// Cross-Tab & Local Event Bus for Real-Time Synchronization across NexaHR
export const broadcastAppEvent = (eventName, data = null) => {
  if (typeof window === 'undefined') return;

  // 1. Dispatch custom event in current window/tab
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  } catch (e) {
    const ev = document.createEvent('CustomEvent');
    ev.initCustomEvent(eventName, false, false, data);
    window.dispatchEvent(ev);
  }

  // 2. BroadcastChannel for modern cross-tab synchronization
  try {
    if (typeof window.BroadcastChannel === 'function') {
      const bc = new BroadcastChannel('nexahr_bus');
      bc.postMessage({ eventName, data, timestamp: Date.now() });
      bc.close();
    }
  } catch (e) {
    // Graceful fallback
  }

  // 3. LocalStorage storage event fallback (fires on other tabs)
  try {
    localStorage.setItem(
      'nexahr_sync_event',
      JSON.stringify({ eventName, data, timestamp: Date.now() })
    );
  } catch (e) {
    // LocalStorage quota or restricted
  }
};

export const subscribeAppEvent = (eventName, callback) => {
  if (typeof window === 'undefined') return () => {};

  // 1. Local window event listener
  const localHandler = (e) => {
    callback(e.detail);
  };
  window.addEventListener(eventName, localHandler);

  // 2. BroadcastChannel listener
  let bc = null;
  try {
    if (typeof window.BroadcastChannel === 'function') {
      bc = new BroadcastChannel('nexahr_bus');
      bc.onmessage = (msg) => {
        if (msg.data?.eventName === eventName) {
          callback(msg.data?.data);
        }
      };
    }
  } catch (e) {}

  // 3. Storage event listener for other tabs
  const storageHandler = (e) => {
    if (e.key === 'nexahr_sync_event' && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        if (payload?.eventName === eventName) {
          callback(payload?.data);
        }
      } catch (err) {}
    }
  };
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(eventName, localHandler);
    if (bc) {
      try {
        bc.close();
      } catch (e) {}
    }
    window.removeEventListener('storage', storageHandler);
  };
};
