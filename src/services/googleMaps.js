import { GOOGLE_MAPS_KEY } from "../config/env";

const MAPS_ORIGIN = "https://maps.googleapis.com/maps/api/js";
const READY_CALLBACK = "__tobaMapsReady";

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

function buildMapsUrl() {
  const params = new URLSearchParams({
    key: GOOGLE_MAPS_KEY,
    callback: READY_CALLBACK,
    v: "weekly",
  });
  return `${MAPS_ORIGIN}?${params.toString()}`;
}

// Skrip resmi Google Maps tidak mendukung Subresource Integrity (isinya berubah
// mengikuti versi "weekly"), sehingga atribut integrity tidak dapat dipasang.
function appendMapsScript(url, onError) {
  const script = document.createElement("script");
  script.setAttribute("src", url); // NOSONAR - sumber tepercaya (Google), SRI tidak tersedia
  script.async = true;
  script.onerror = onError;
  document.head.appendChild(script);
}

export function loadGoogleMaps() {
  if (globalThis.google?.maps?.Map) return Promise.resolve(globalThis.google.maps);
  if (loader) return loader;
  if (!GOOGLE_MAPS_KEY) return Promise.reject(new Error("NO_KEY"));

  loader = new Promise((resolve, reject) => {
    globalThis[READY_CALLBACK] = () => resolve(globalThis.google.maps);
    appendMapsScript(buildMapsUrl(), () => {
      loader = null;
      reject(new Error("LOAD_FAILED"));
    });
  });
  return loader;
}