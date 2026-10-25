import { describe, test, expect, vi, beforeEach } from "vitest";

const hook = vi.hoisted(() => ({ onExpired: null }));
vi.mock("../src/services/authApi", () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  meRequest: vi.fn(),
  logoutRequest: vi.fn(),
}));
vi.mock("../src/services/httpClient", () => ({
  onUnauthorized: (fn) => { hook.onExpired = fn; },
}));

import { auth, restoreSession, login, register, logout } from "../src/composables/useAuth";
import { loginRequest, registerRequest, meRequest, logoutRequest } from "../src/services/authApi";
import { getToken, setToken } from "../src/services/tokenStorage";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  auth.user = null;
  auth.ready = false;
});

describe("useAuth", () => {
  test("restoreSession tanpa token hanya menandai siap", async () => {
    await restoreSession();
    expect(meRequest).not.toHaveBeenCalled();
    expect(auth.user).toBeNull();
    expect(auth.ready).toBe(true);
  });

  test("restoreSession memulihkan user bila token berlaku", async () => {
    setToken("t");
    meRequest.mockResolvedValue({ id: 1, nama: "Budi" });
    await restoreSession();
    expect(auth.user).toEqual({ id: 1, nama: "Budi" });
    expect(auth.ready).toBe(true);
  });

  test("restoreSession membuang token yang sudah tidak berlaku", async () => {
    setToken("kadaluarsa");
    meRequest.mockRejectedValue(new Error("401"));
    await restoreSession();
    expect(auth.user).toBeNull();
    expect(getToken()).toBeNull();
    expect(auth.ready).toBe(true);
  });

  test("login menyimpan token dan user", async () => {
    loginRequest.mockResolvedValue({ user: { id: 2 }, token: "tok" });
    await login("budi", "rahasia");
    expect(loginRequest).toHaveBeenCalledWith("budi", "rahasia");
    expect(getToken()).toBe("tok");
    expect(auth.user).toEqual({ id: 2 });
  });

  test("login yang gagal melempar error dan tidak mengubah state", async () => {
    loginRequest.mockRejectedValue(new Error("salah"));
    await expect(login("a", "b")).rejects.toThrow("salah");
    expect(auth.user).toBeNull();
  });

  test("register menyimpan token dan user", async () => {
    registerRequest.mockResolvedValue({ user: { id: 3 }, token: "tok3" });
    await register({ username: "baru" });
    expect(registerRequest).toHaveBeenCalledWith({ username: "baru" });
    expect(getToken()).toBe("tok3");
    expect(auth.user).toEqual({ id: 3 });
  });

  test("logout membersihkan sesi", async () => {
    setToken("t");
    auth.user = { id: 1 };
    logoutRequest.mockResolvedValue({});
    await logout();
    expect(getToken()).toBeNull();
    expect(auth.user).toBeNull();
  });

  test("logout tetap membersihkan sesi walau server menolak", async () => {
    setToken("t");
    auth.user = { id: 1 };
    logoutRequest.mockRejectedValue(new Error("401"));
    await logout();
    expect(getToken()).toBeNull();
    expect(auth.user).toBeNull();
  });

  test("sesi habis (401) mengosongkan user", () => {
    auth.user = { id: 1 };
    hook.onExpired();
    expect(auth.user).toBeNull();
  });
});