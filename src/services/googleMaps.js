// Memuat Google Maps JavaScript API sekali saja, tanpa paket npm tambahan.
import { GOOGLE_MAPS_KEY } from "../config/env";

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

export const hasMapsKey = () => Boolean(GOOGLE_MAPS_KEY);

export function loadGoogleMaps() {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (loader) return loader;

  if (!GOOGLE_MAPS_KEY) return Promise.reject(new Error("NO_KEY"));

  loader = new Promise((resolve, reject) => {
    window.__tobaMapsReady = () => resolve(window.google.maps);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}&callback=__tobaMapsReady&v=weekly`;
    s.async = true;
    s.onerror = () => { loader = null; reject(new Error("LOAD_FAILED")); };
    document.head.appendChild(s);
  });
  return loader;
}
