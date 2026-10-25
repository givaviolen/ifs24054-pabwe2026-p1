import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { http, getWithRetry, onUnauthorized } from "../src/services/httpClient";
import { loginRequest, registerRequest, meRequest, logoutRequest } from "../src/services/authApi";
import { getSpots, getSpot, createSpot, updateSpot, deleteSpot, addCondition } from "../src/services/spotApi";
import { setToken, getToken } from "../src/services/tokenStorage";

const calls = [];
let handler;

function ok(config, data, status = 200) {
  return Promise.resolve({ data, status, statusText: "OK", headers: {}, config, request: {} });
}
function fail(config, status, data = {}) {
  const response = { data, status, statusText: "ERR", headers: {}, config, request: {} };
  return Promise.reject(new axios.AxiosError(`HTTP ${status}`, "ERR_BAD_RESPONSE", config, {}, response));
}
function networkError(config) {
  return Promise.reject(new axios.AxiosError("Network Error", "ERR_NETWORK", config, {}));
}

beforeEach(() => {
  calls.length = 0;
  localStorage.clear();
  handler = (config) => ok(config, { ok: true });
  http.defaults.adapter = (config) => {
    calls.push(config);
    return handler(config);
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  onUnauthorized(null);
});

describe("httpClient interceptors", () => {
  test("menambahkan header Authorization bila token ada", async () => {
    setToken("tok123");
    await http.get("/x");
    expect(calls[0].headers.get("Authorization")).toBe("Bearer tok123");
  });

  test("tanpa token tidak ada header Authorization", async () => {
    await http.get("/x");
    expect(calls[0].headers.get("Authorization")).toBeFalsy();
  });

  test("401 saat login: token dihapus dan handler dipanggil", async () => {
    setToken("tok123");
    const onExpired = vi.fn();
    onUnauthorized(onExpired);
    handler = (config) => fail(config, 401);
    await expect(http.get("/spots")).rejects.toBeTruthy();
    expect(getToken()).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  test("401 tanpa handler terdaftar tidak error", async () => {
    setToken("tok123");
    handler = (config) => fail(config, 401);
    await expect(http.get("/spots")).rejects.toBeTruthy();
    expect(getToken()).toBeNull();
  });

  test("401 pada /auth/login tidak menghapus token", async () => {
    setToken("tok123");
    const onExpired = vi.fn();
    onUnauthorized(onExpired);
    handler = (config) => fail(config, 401);
    await expect(http.post("/auth/login", {})).rejects.toBeTruthy();
    expect(getToken()).toBe("tok123");
    expect(onExpired).not.toHaveBeenCalled();
  });

  test("401 tanpa token tersimpan diabaikan; error lain diteruskan", async () => {
    const onExpired = vi.fn();
    onUnauthorized(onExpired);
    handler = (config) => fail(config, 401);
    await expect(http.get("/spots")).rejects.toBeTruthy();
    handler = (config) => fail(config, 500);
    await expect(http.get("/spots")).rejects.toBeTruthy();
    expect(onExpired).not.toHaveBeenCalled();
  });

  test("error tanpa config tetap diteruskan", async () => {
    handler = () => Promise.reject(new Error("aneh"));
    await expect(http.get("/spots")).rejects.toThrow("aneh");
  });
});

describe("getWithRetry", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "setTimeout").mockImplementation((fn) => {
      fn();
      return 0;
    });
  });

  test("berhasil pada percobaan pertama", async () => {
    const res = await getWithRetry("/spots");
    expect(res.data).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
  });

  test("mengulang error jaringan lalu berhasil", async () => {
    let n = 0;
    handler = (config) => (++n < 3 ? networkError(config) : ok(config, { ok: 1 }));
    const res = await getWithRetry("/spots");
    expect(res.data).toEqual({ ok: 1 });
    expect(calls).toHaveLength(3);
  });

  test("mengulang status 502 ke atas", async () => {
    let n = 0;
    handler = (config) => (++n < 2 ? fail(config, 503) : ok(config, {}));
    await getWithRetry("/spots");
    expect(calls).toHaveLength(2);
  });

  test("menyerah setelah batas percobaan", async () => {
    handler = (config) => networkError(config);
    await expect(getWithRetry("/spots", undefined, 2)).rejects.toBeTruthy();
    expect(calls).toHaveLength(3);
  });

  test("tidak mengulang error 404", async () => {
    handler = (config) => fail(config, 404);
    await expect(getWithRetry("/spots")).rejects.toBeTruthy();
    expect(calls).toHaveLength(1);
  });
});

describe("authApi", () => {
  test("loginRequest mengirim kredensial dan mengembalikan data", async () => {
    handler = (config) => ok(config, { user: { id: 1 }, token: "t" });
    expect(await loginRequest("u", "p")).toEqual({ user: { id: 1 }, token: "t" });
    expect(calls[0].method).toBe("post");
    expect(calls[0].url).toBe("/auth/login");
    expect(JSON.parse(calls[0].data)).toEqual({ username: "u", password: "p" });
  });

  test("registerRequest", async () => {
    handler = (config) => ok(config, { user: { id: 2 }, token: "t2" });
    expect(await registerRequest({ username: "u" })).toEqual({ user: { id: 2 }, token: "t2" });
    expect(calls[0].url).toBe("/auth/register");
  });

  test("meRequest mengembalikan user", async () => {
    handler = (config) => ok(config, { user: { id: 3, nama: "Budi" } });
    expect(await meRequest()).toEqual({ id: 3, nama: "Budi" });
    expect(calls[0].url).toBe("/auth/me");
  });

  test("logoutRequest", async () => {
    handler = (config) => ok(config, { ok: true });
    expect(await logoutRequest()).toEqual({ ok: true });
    expect(calls[0].url).toBe("/auth/logout");
  });
});

describe("spotApi", () => {
  test("getSpots membawa parameter dan mengembalikan seluruh body", async () => {
    handler = (config) => ok(config, { data: [{ id: 1 }] });
    expect(await getSpots({ q: "a" })).toEqual({ data: [{ id: 1 }] });
    expect(calls[0].url).toBe("/spots");
    expect(calls[0].params).toEqual({ q: "a" });
    await getSpots();
    expect(calls[1].params).toEqual({});
  });

  test("getSpot mengembalikan data pantai", async () => {
    handler = (config) => ok(config, { data: { id: 7 } });
    expect(await getSpot(7)).toEqual({ id: 7 });
    expect(calls[0].url).toBe("/spots/7");
  });

  test("createSpot, updateSpot, deleteSpot, addCondition", async () => {
    handler = (config) => ok(config, { data: { id: 9 }, current_status: "AMAN" });
    expect(await createSpot({ a: 1 })).toEqual({ id: 9 });
    expect(calls[0]).toMatchObject({ method: "post", url: "/spots" });
    expect(await updateSpot(9, { a: 2 })).toEqual({ id: 9 });
    expect(calls[1]).toMatchObject({ method: "put", url: "/spots/9" });
    await deleteSpot(9);
    expect(calls[2]).toMatchObject({ method: "delete", url: "/spots/9" });
    expect(await addCondition({ spot_id: 9 })).toMatchObject({ current_status: "AMAN" });
    expect(calls[3]).toMatchObject({ method: "post", url: "/conditions" });
  });
});