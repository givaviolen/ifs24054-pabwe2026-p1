import { http } from "./httpClient";

// Endpoint autentikasi petugas.
export const loginRequest = (username, password) =>
  http.post("/auth/login", { username, password }).then((r) => r.data);
export const registerRequest = (payload) => http.post("/auth/register", payload).then((r) => r.data);
export const meRequest = () => http.get("/auth/me").then((r) => r.data.user);
export const logoutRequest = () => http.post("/auth/logout").then((r) => r.data);
