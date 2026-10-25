import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { http, getWithRetry, onUnauthorized } from "../src/services/httpClient";
import { loginRequest, registerRequest, meRequest, logoutRequest } from "../src/services/authApi";
import { getSpots, getSpot, createSpot, updateSpot, deleteSpot, addCondition } from "../src/services/spotApi";
import { setToken, getToken } from "../src/services/tokenStorage";

const calls = [];
let handler;

const reply = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
});
const ok = (body = { ok: true }, status = 200) => Promise.resolve(reply(status, body));
const fail = (status, body = {}) => Promise.resolve(reply(status, body));
const networkError = () => Promise.reject(new TypeError("Failed to fetch"));

beforeEach(() => {
  calls.length = 0;
  localStorage.clear();
  handler = () => ok();
  vi.stubGlobal(
    "fetch",
    vi.fn((url, init) => {
      calls.push({ url, ...init });
      return handler(url, init);
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  onUnauthorized(null);
});

describe("httpClient permintaan", () => {
  test("menambahkan header Authorization bila token ada", async () => {
    setToken("tok123");
    await http.get("/x");
    expect(calls[0].headers.Authorization).toBe("Bearer tok123");
  });

  test("tanpa token tidak ada header Authorization", async () => {
    await http.get("/x");
    expect(calls[0].headers.Authorization).toBeUndefined();
  });

  test("GET berprioritas rendah, metode lain biasa", async () => {
    await http.get("/x");
    await http.delete("/x");
    expect(calls[0]).toMatchObject({ method: "GET", priority: "low" });
    expect(calls[1]).toMatchObject({ method: "DELETE", priority: "auto" });
  });

  test("body JSON hanya dikirim bila ada data", async () => {
    await http.post("/x", { a: 1 });
    await http.get("/x");
    expect(calls[0].body).toBe('{"a":1}');
    expect(calls[0].headers["Content-Type"]).toBe("application/json");
    expect(calls[1].body).toBeUndefined();
    expect(calls[1].headers["Content-Type"]).toBeUndefined();
  });

  test("parameter query disusun dan nilai kosong dilewati", async () => {
    await http.get("/x", { params: { a: "b c", n: 1, kosong: null, hilang: undefined } });
    await http.get("/x", { params: {} });
    await http.get("/x");
    expect(calls[0].url).toMatch(/\/x\?a=b\+c&n=1$/);
    expect(calls[1].url).toMatch(/\/x$/);
    expect(calls[2].url).toMatch(/\/x$/);
  });

  test("isi balasan: JSON, teks biasa, atau kosong", async () => {
    handler = () => ok({ a: 1 });
    expect((await http.get("/x")).data).toEqual({ a: 1 });
    handler = () => ok("bukan json");
    expect((await http.get("/x")).data).toBe("bukan json");
    handler = () => ok("", 204);
    expect(await http.get("/x")).toEqual({ data: "", status: 204 });
  });

  test("error jaringan diberi kode ERR_NETWORK", async () => {
    handler = networkError;
    await expect(http.get("/x")).rejects.toMatchObject({ message: "Network Error", code: "ERR_NETWORK", request: true });
  });

  test("permintaan yang melewati batas waktu dilaporkan sebagai ECONNABORTED", async () => {
    handler = () => Promise.reject(Object.assign(new Error("waktu habis"), { name: "TimeoutError" }));
    await expect(http.get("/x")).rejects.toMatchObject({ code: "ECONNABORTED", message: "timeout exceeded" });
    handler = () => Promise.reject(Object.assign(new Error("batal"), { name: "AbortError" }));
    await expect(http.get("/x")).rejects.toMatchObject({ code: "ECONNABORTED" });
  });

  test("batas waktu permintaan dipasang pada fetch", async () => {
    await http.get("/x");
    expect(calls[0].signal).toBeInstanceOf(AbortSignal);
  });

  test("status gagal membawa response dengan status dan body", async () => {
    handler = () => fail(422, { error: "salah" });
    await expect(http.get("/x")).rejects.toMatchObject({ response: { status: 422, data: { error: "salah" } } });
  });
});

describe("httpClient sesi habis", () => {
  test("401 saat login: token dihapus dan handler dipanggil", async () => {
    setToken("tok123");
    const onExpired = vi.fn();
    onUnauthorized(onExpired);
    handler = () => fail(401);
    await expect(http.get("/spots")).rejects.toBeTruthy();
    expect(getToken()).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  test("401 tanpa handler terdaftar tidak error", async () => {
    setToken("tok123");
    handler = () => fail(401);
    await expect(http.get("/spots")).rejects.toBeTruthy();
    expect(getToken()).toBeNull();
  });

  test("401 pada /auth/login tidak menghapus token", async () => {
    setToken("tok123");
    const onExpired = vi.fn();
    onUnauthorized(onExpired);
    handler = () => fail(401);
    await expect(http.post("/auth/login", {})).rejects.toBeTruthy();
    expect(getToken()).toBe("tok123");
    expect(onExpired).not.toHaveBeenCalled();
  });

  test("401 tanpa token tersimpan diabaikan; error lain diteruskan", async () => {
    const onExpired = vi.fn();
    onUnauthorized(onExpired);
    handler = () => fail(401);
    await expect(http.get("/spots")).rejects.toBeTruthy();
    handler = () => fail(500);
    await expect(http.get("/spots")).rejects.toBeTruthy();
    expect(onExpired).not.toHaveBeenCalled();
  });
});

describe("getWithRetry", () => {
  beforeEach(() => {
    // Jeda antar percobaan dilewati.
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
    handler = () => (++n < 3 ? networkError() : ok({ ok: 1 }));
    const res = await getWithRetry("/spots");
    expect(res.data).toEqual({ ok: 1 });
    expect(calls).toHaveLength(3);
  });

  test("mengulang status 502 ke atas", async () => {
    let n = 0;
    handler = () => (++n < 2 ? fail(503) : ok({}));
    await getWithRetry("/spots");
    expect(calls).toHaveLength(2);
  });

  test("menyerah setelah batas percobaan", async () => {
    handler = networkError;
    await expect(getWithRetry("/spots", undefined, 2)).rejects.toBeTruthy();
    expect(calls).toHaveLength(3);
  });

  test("tidak mengulang error 404", async () => {
    handler = () => fail(404);
    await expect(getWithRetry("/spots")).rejects.toBeTruthy();
    expect(calls).toHaveLength(1);
  });
});

describe("authApi", () => {
  test("loginRequest mengirim kredensial dan mengembalikan data", async () => {
    handler = () => ok({ user: { id: 1 }, token: "t" });
    expect(await loginRequest("u", "p")).toEqual({ user: { id: 1 }, token: "t" });
    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toMatch(/\/auth\/login$/);
    expect(JSON.parse(calls[0].body)).toEqual({ username: "u", password: "p" });
  });

  test("registerRequest", async () => {
    handler = () => ok({ user: { id: 2 }, token: "t2" });
    expect(await registerRequest({ username: "u" })).toEqual({ user: { id: 2 }, token: "t2" });
    expect(calls[0].url).toMatch(/\/auth\/register$/);
  });

  test("meRequest mengembalikan user", async () => {
    handler = () => ok({ user: { id: 3, nama: "Budi" } });
    expect(await meRequest()).toEqual({ id: 3, nama: "Budi" });
    expect(calls[0].url).toMatch(/\/auth\/me$/);
  });

  test("logoutRequest", async () => {
    handler = () => ok({ ok: true });
    expect(await logoutRequest()).toEqual({ ok: true });
    expect(calls[0].url).toMatch(/\/auth\/logout$/);
  });
});

describe("spotApi", () => {
  test("getSpots membawa parameter dan mengembalikan seluruh body", async () => {
    handler = () => ok({ data: [{ id: 1 }] });
    expect(await getSpots({ q: "a" })).toEqual({ data: [{ id: 1 }] });
    expect(calls[0].url).toMatch(/\/spots\?q=a$/);
    await getSpots();
    expect(calls[1].url).toMatch(/\/spots$/);
  });

  test("getSpot mengembalikan data pantai", async () => {
    handler = () => ok({ data: { id: 7 } });
    expect(await getSpot(7)).toEqual({ id: 7 });
    expect(calls[0].url).toMatch(/\/spots\/7$/);
  });

  test("createSpot, updateSpot, deleteSpot, addCondition", async () => {
    handler = () => ok({ data: { id: 9 }, current_status: "AMAN" });
    expect(await createSpot({ a: 1 })).toEqual({ id: 9 });
    expect(calls[0]).toMatchObject({ method: "POST" });
    expect(await updateSpot(9, { a: 2 })).toEqual({ id: 9 });
    expect(calls[1]).toMatchObject({ method: "PUT" });
    expect(calls[1].url).toMatch(/\/spots\/9$/);
    await deleteSpot(9);
    expect(calls[2]).toMatchObject({ method: "DELETE" });
    expect(await addCondition({ spot_id: 9 })).toMatchObject({ current_status: "AMAN" });
    expect(calls[3].url).toMatch(/\/conditions$/);
  });
});