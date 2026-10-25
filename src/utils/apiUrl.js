// VITE_API_URL boleh ditulis dengan atau tanpa "/api" di belakangnya
// (kesalahan paling umum saat deploy): keduanya dinormalisasi menjadi ".../api".
export const DEFAULT_API_URL = "http://localhost:3000/api";

export function normalizeApiUrl(value) {
  let url = String(value ?? "").trim();
  while (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  if (!url) return DEFAULT_API_URL;
  return /\/api$/i.test(url) ? url : `${url}/api`;
}