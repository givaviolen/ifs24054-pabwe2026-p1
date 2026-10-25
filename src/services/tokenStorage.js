// Token petugas disimpan di browser agar tetap login setelah refresh.
const TOKEN_KEY = "tws_token";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token) {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* abaikan */ }
}
