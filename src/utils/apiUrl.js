// VITE_API_URL boleh ditulis dengan atau tanpa "/api" di belakangnya
// (kesalahan paling umum saat deploy): keduanya dinormalisasi menjadi ".../api".
export const DEFAULT_API_URL = "http://localhost:3000/api";

export function normalizeApiUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return DEFAULT_API_URL;

  let end = raw.length;
  for (let i = raw.length - 1; i > 0; i--) {
    if (raw[i] === "/") {
      end = i;
    } else {
      break;
    }
  }

  const url = raw.slice(0, end);
  return /\/api$/i.test(url) ? url : `${url}/api`;
}