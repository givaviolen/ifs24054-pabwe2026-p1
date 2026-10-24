import axios from "axios";

const TOKEN_KEY = "tws_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

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

// ---- data pantai ----
export const getSpots = (params = {}) => api.get("/spots", { params }).then((r) => r.data);
export const getSpot = (id) => api.get(`/spots/${id}`).then((r) => r.data.data);
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
