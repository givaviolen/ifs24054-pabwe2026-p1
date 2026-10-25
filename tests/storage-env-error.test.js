import { describe, test, expect, vi, afterEach } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
  localStorage.clear();
});

describe("tokenStorage", () => {
  test("menyimpan, membaca, dan menghapus token", async () => {
    const { getToken, setToken } = await import("../src/services/tokenStorage");
    expect(getToken()).toBeNull();
    setToken("abc");
    expect(getToken()).toBe("abc");
    setToken(null);
    expect(getToken()).toBeNull();
  });

  test("tidak melempar error bila localStorage tidak tersedia", async () => {
    const { getToken, setToken } = await import("../src/services/tokenStorage");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(getToken()).toBeNull();
    expect(() => setToken("x")).not.toThrow();
    expect(() => setToken(null)).not.toThrow();
  });
});

describe("config/env", () => {
  test("memakai nilai bawaan bila variabel kosong", async () => {
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "");
    const env = await import("../src/config/env");
    expect(env.API_URL).toBe("http://localhost:3000/api");
    expect(env.GOOGLE_MAPS_KEY).toBe("");
    expect(env.REQUEST_TIMEOUT_MS).toBe(20000);
  });

  test("menormalkan VITE_API_URL dan menerima API key asli", async () => {
    vi.stubEnv("VITE_API_URL", "https://be.example.com/");
    vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "  KEY-ASLI-123 ");
    const env = await import("../src/config/env");
    expect(env.API_URL).toBe("https://be.example.com/api");
    expect(env.GOOGLE_MAPS_KEY).toBe("KEY-ASLI-123");
  });

  test("nilai contoh .env dianggap belum diisi", async () => {
    vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "ISI_API_KEY_ANDA");
    const env = await import("../src/config/env");
    expect(env.GOOGLE_MAPS_KEY).toBe("");
  });

  test("API_URL_MISSING aktif di build produksi tanpa VITE_API_URL", async () => {
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("PROD", true);
    const env = await import("../src/config/env");
    expect(env.API_URL_MISSING).toBe(true);
  });
});

describe("describeError", () => {
  test("error HTTP dengan pesan dari server", async () => {
    const { describeError } = await import("../src/services/apiError");
    const r = describeError({ response: { status: 400, data: { error: "Data salah" } } });
    expect(r).toEqual({ kind: "http", message: "Data salah", hint: "" });
  });

  test("error HTTP tanpa pesan menampilkan kode dan alamat API", async () => {
    const { describeError } = await import("../src/services/apiError");
    const r = describeError({ response: { status: 500, data: {} } });
    expect(r.kind).toBe("http");
    expect(r.message).toContain("500");
    expect(r.hint).toContain("Alamat API:");
  });

  test("timeout", async () => {
    const { describeError } = await import("../src/services/apiError");
    expect(describeError({ code: "ECONNABORTED" }).kind).toBe("timeout");
  });

  test("error jaringan (request ada atau pesan Network Error)", async () => {
    const { describeError } = await import("../src/services/apiError");
    const a = describeError({ request: {} });
    expect(a.kind).toBe("network");
    expect(a.hint).toContain("Pastikan Back-End berjalan");
    expect(describeError({ message: "Network Error" }).kind).toBe("network");
  });

  test("petunjuk khusus saat VITE_API_URL belum diatur di produksi", async () => {
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("PROD", true);
    const { describeError } = await import("../src/services/apiError");
    expect(describeError({ request: {} }).hint).toContain("VITE_API_URL belum diatur");
  });

  test("error tak dikenal memakai pesan cadangan", async () => {
    const { describeError } = await import("../src/services/apiError");
    expect(describeError(new Error("x"), "Gagal.")).toEqual({ kind: "unknown", message: "Gagal.", hint: "" });
    expect(describeError(undefined).message).toBe("Terjadi kesalahan.");
  });
});