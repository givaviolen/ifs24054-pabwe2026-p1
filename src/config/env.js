// Seluruh pembacaan variabel lingkungan Vite dipusatkan di sini.
import { normalizeApiUrl } from "../utils/apiUrl";

const rawApiUrl = String(import.meta.env.VITE_API_URL ?? "").trim();
export const API_URL = normalizeApiUrl(rawApiUrl);
// Build produksi tanpa VITE_API_URL akan memanggil localhost milik pengunjung, pasti gagal.
export const API_URL_MISSING = import.meta.env.PROD && !rawApiUrl;
export const REQUEST_TIMEOUT_MS = 20000;

// Nilai contoh dari .env.example dianggap belum diisi.
const rawMapsKey = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "").trim();
export const GOOGLE_MAPS_KEY = /ISI_API_KEY|KEY_ANDA/i.test(rawMapsKey) ? "" : rawMapsKey;
