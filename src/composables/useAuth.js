import { reactive } from "vue";
import { loginRequest, registerRequest, meRequest, logoutRequest } from "../services/authApi";
import { getToken, setToken } from "../services/tokenStorage";
import { onUnauthorized } from "../services/httpClient";

// State login global (dibagi seluruh komponen).
export const auth = reactive({ user: null, ready: false });

onUnauthorized(() => { auth.user = null; });

// Dipanggil saat aplikasi dibuka: pulihkan sesi bila token masih berlaku.
export async function restoreSession() {
  if (getToken()) {
    try { auth.user = await meRequest(); } catch { setToken(null); auth.user = null; }
  }
  auth.ready = true;
}

export async function login(username, password) {
  const { user, token } = await loginRequest(username, password);
  setToken(token);
  auth.user = user;
}

export async function register(payload) {
  const { user, token } = await registerRequest(payload);
  setToken(token);
  auth.user = user;
}

export async function logout() {
  try { await logoutRequest(); } catch { /* token mungkin sudah tidak berlaku */ }
  setToken(null);
  auth.user = null;
}
