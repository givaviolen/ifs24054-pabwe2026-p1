// Memuat Google Maps JavaScript API sekali saja, tanpa paket npm tambahan.
let loader = null;
let authFailed = false;
const authListeners = new Set();

// Google memanggil fungsi global ini bila API key ditolak (setelah skrip termuat).
window.gm_authFailure = () => {
  authFailed = true;
  authListeners.forEach((fn) => fn());
};

export function onMapsAuthFailure(fn) {
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}
export const isMapsAuthFailed = () => authFailed;

// Nilai contoh dari .env.example dianggap belum diisi.
function readKey() {
  const key = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").trim();
  if (!key || /ISI_API_KEY|KEY_ANDA/i.test(key)) return "";
  return key;
}

export function hasMapsKey() {
  return Boolean(readKey());
}

export function loadGoogleMaps() {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (loader) return loader;

  const key = readKey();
  if (!key) return Promise.reject(new Error("NO_KEY"));

  loader = new Promise((resolve, reject) => {
    window.__tobaMapsReady = () => resolve(window.google.maps);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=__tobaMapsReady&v=weekly`;
    s.async = true;
    s.onerror = () => { loader = null; reject(new Error("LOAD_FAILED")); };
    document.head.appendChild(s);
  });
  return loader;
}
