import axios from "axios";

const TOKEN_KEY = "tws_token";

// ---- alamat API ----
// VITE_API_URL boleh ditulis dengan atau tanpa "/api" di belakangnya
// (kesalahan paling umum saat deploy): keduanya dinormalisasi menjadi ".../api".
export function normalizeApiUrl(value) {
  const url = String(value ?? "").trim().replace(/\/+$/, "");
  if (!url) return "http://localhost:3000/api";
  return /\/api$/i.test(url) ? url : `${url}/api`;
}

const RAW_URL = import.meta.env.VITE_API_URL || "";
export const API_URL = normalizeApiUrl(RAW_URL);
// Build produksi tanpa VITE_API_URL akan memanggil localhost milik pengunjung, pasti gagal.
export const API_URL_MISSING = import.meta.env.PROD && !String(RAW_URL).trim();

const api = axios.create({ baseURL: API_URL, timeout: 20000 });

// ---- token petugas (disimpan di browser agar tetap login setelah refresh) ----
export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* abaikan */ }
}

let unauthorizedHandler = null;
export const onUnauthorized = (fn) => { unauthorizedHandler = fn; };

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sesi habis / token tidak valid -> keluarkan petugas dari panel.
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && getToken() && !url.startsWith("/auth/login")) {
      setToken(null);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

// Mengubah error axios menjadi pesan yang ramah dibaca + petunjuk perbaikan.
export function describeError(error, fallback = "Terjadi kesalahan.") {
  if (error?.response) {
    const msg = error.response.data?.error;
    if (msg) return { kind: "http", message: msg, hint: "" };
    return { kind: "http", message: `Server membalas dengan kode ${error.response.status}.`, hint: `Alamat API: ${API_URL}` };
  }
  if (error?.code === "ECONNABORTED") {
    return {
      kind: "timeout",
      message: "Server API terlalu lama merespons.",
      hint: "Server gratis dapat butuh beberapa detik untuk bangun. Coba lagi sebentar.",
    };
  }
  if (error?.request || error?.message === "Network Error") {
    return {
      kind: "network",
      message: "Tidak dapat terhubung ke server API.",
      hint: API_URL_MISSING
        ? "VITE_API_URL belum diatur pada build ini. Isi di Environment Variables Vercel (Front-End), lalu redeploy."
        : `Pastikan Back-End berjalan di ${API_URL} dan CORS mengizinkan situs ini.`,
    };
  }
  return { kind: "unknown", message: fallback, hint: "" };
}

// GET dengan percobaan ulang untuk error jaringan/timeout (mis. cold start serverless).
async function get(url, config, retries = 2) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await api.get(url, config);
    } catch (e) {
      const transient = !e.response || e.response.status >= 502;
      if (!transient || attempt >= retries) throw e;
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
    }
  }
}

// ---- data pantai ----
export const getSpots = (params = {}) => get("/spots", { params }).then((r) => r.data);
export const getSpot = (id) => get(`/spots/${id}`).then((r) => r.data.data);
export const createSpot = (payload) => api.post("/spots", payload).then((r) => r.data.data);
export const updateSpot = (id, payload) => api.put(`/spots/${id}`, payload).then((r) => r.data.data);
export const deleteSpot = (id) => api.delete(`/spots/${id}`);
export const addCondition = (payload) => api.post("/conditions", payload).then((r) => r.data);

// ---- autentikasi petugas ----
export const loginRequest = (username, password) =>
  api.post("/auth/login", { username, password }).then((r) => r.data);
export const registerRequest = (payload) => api.post("/auth/register", payload).then((r) => r.data);
export const meRequest = () => api.get("/auth/me").then((r) => r.data.user);
export const logoutRequest = () => api.post("/auth/logout").then((r) => r.data);
