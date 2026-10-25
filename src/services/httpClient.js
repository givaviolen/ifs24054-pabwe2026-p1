import axios from "axios";
import { API_URL, REQUEST_TIMEOUT_MS } from "../config/env";
import { getToken, setToken } from "./tokenStorage";

const RETRY_DELAY_MS = 1200;

export const http = axios.create({ baseURL: API_URL, timeout: REQUEST_TIMEOUT_MS });

// Pemanggil (useAuth) mendaftarkan apa yang terjadi saat sesi habis.
let unauthorizedHandler = null;
export const onUnauthorized = (fn) => { unauthorizedHandler = fn; };

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sesi habis / token tidak valid -> keluarkan petugas dari panel.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && getToken() && !url.startsWith("/auth/login")) {
      setToken(null);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

// GET dengan percobaan ulang untuk error jaringan/timeout (mis. cold start serverless).
export async function getWithRetry(url, config, retries = 2) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await http.get(url, config);
    } catch (e) {
      const transient = !e.response || e.response.status >= 502;
      if (!transient || attempt >= retries) throw e;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
    }
  }
}
