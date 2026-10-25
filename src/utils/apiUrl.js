// VITE_API_URL boleh ditulis dengan atau tanpa "/api" di belakangnya
// (kesalahan paling umum saat deploy): keduanya dinormalisasi menjadi ".../api".
export const DEFAULT_API_URL = "http://localhost:3000/api";

export function normalizeApiUrl(value) {
  const url = String(value ?? "").trim().replace(/\/+$/, "");
  if (!url) return DEFAULT_API_URL;
  return /\/api$/i.test(url) ? url : `${url}/api`;
}
