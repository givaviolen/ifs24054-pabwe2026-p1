import { GOOGLE_MAPS_KEY } from "../config/env";

let loader = null;
let authFailed = false;
const authListeners = new Set();

// Google memanggil fungsi global ini bila API key ditolak (setelah skrip termuat).
globalThis.gm_authFailure = () => {
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
  if (globalThis.google?.maps?.Map) return Promise.resolve(globalThis.google.maps);
  if (loader) return loader;
  if (!GOOGLE_MAPS_KEY) return Promise.reject(new Error("NO_KEY"));

  loader = new Promise((resolve, reject) => {
    globalThis.__tobaMapsReady = () => resolve(globalThis.google.maps);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}&callback=__tobaMapsReady&v=weekly`;
    s.async = true;
    s.onerror = () => {
      loader = null;
      reject(new Error("LOAD_FAILED"));
    };
    document.head.appendChild(s);
  });
  return loader;
}