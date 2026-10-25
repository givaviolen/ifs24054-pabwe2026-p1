import { API_URL, REQUEST_TIMEOUT_MS } from "../config/env";
import { getToken, setToken } from "./tokenStorage";

const RETRY_DELAY_MS = 1200;

// Pemanggil (useAuth) mendaftarkan apa yang terjadi saat sesi habis.
let unauthorizedHandler = null;
export const onUnauthorized = (fn) => { unauthorizedHandler = fn; };

function buildUrl(path, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) query.append(key, String(value));
  }
  const search = query.toString();
  return `${API_URL}${path}${search ? `?${search}` : ""}`;
}

// Bentuk error dibuat serupa error HTTP klien populer agar describeError tetap sederhana.
function requestError(message, details) {
  return Object.assign(new Error(message), details);
}

async function readBody(res) {
  const text = await res.text();
  if (!text) return "";
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Sesi habis / token tidak valid -> keluarkan petugas dari panel.
function handleUnauthorized(status, path) {
  if (status === 401 && getToken() && !path.startsWith("/auth/login")) {
    setToken(null);
    unauthorizedHandler?.();
  }
}

async function send(method, path, { params, data } = {}) {
  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (data !== undefined) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      // Pengambilan data bukan bagian jalur kritis render halaman.
      priority: method === "GET" ? "low" : "auto",
    });
    const body = await readBody(res);
    if (!res.ok) {
      handleUnauthorized(res.status, path);
      throw requestError(`Request failed with status code ${res.status}`, {
        config: { url: path },
        request: true,
        response: { status: res.status, data: body },
      });
    }
    return { data: body, status: res.status };
  } catch (error) {
    if (error.response) throw error;
    const aborted = error.name === "TimeoutError" || error.name === "AbortError";
    throw requestError(aborted ? "timeout exceeded" : "Network Error", {
      code: aborted ? "ECONNABORTED" : "ERR_NETWORK",
      config: { url: path },
      request: true,
    });
  }
}

export const http = {
  get: (path, config) => send("GET", path, config),
  post: (path, data) => send("POST", path, { data }),
  put: (path, data) => send("PUT", path, { data }),
  delete: (path) => send("DELETE", path),
};

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