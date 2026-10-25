import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

const envMock = vi.hoisted(() => ({ GOOGLE_MAPS_KEY: "kunci-tes" }));
vi.mock("../src/config/env", () => envMock);

async function fresh(key = "kunci-tes") {
  envMock.GOOGLE_MAPS_KEY = key;
  vi.resetModules();
  return import("../src/services/googleMaps");
}

let scripts;

beforeEach(() => {
  scripts = [];
  delete globalThis.google;
  delete globalThis.__tobaMapsReady;
  // Jangan benar-benar memuat skrip dari internet.
  vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
    scripts.push(node);
    return node;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  delete globalThis.google;
});

describe("googleMaps", () => {
  test("hasMapsKey mengikuti konfigurasi", async () => {
    expect((await fresh("abc")).hasMapsKey()).toBe(true);
    expect((await fresh("")).hasMapsKey()).toBe(false);
  });

  test("langsung selesai bila Google Maps sudah termuat", async () => {
    const maps = { Map: function Map() {} };
    globalThis.google = { maps };
    const { loadGoogleMaps } = await fresh();
    await expect(loadGoogleMaps()).resolves.toBe(maps);
    expect(scripts).toHaveLength(0);
  });

  test("ditolak NO_KEY bila API key kosong", async () => {
    const { loadGoogleMaps } = await fresh("");
    await expect(loadGoogleMaps()).rejects.toThrow("NO_KEY");
  });

  test("memasang skrip sekali dan selesai saat callback dipanggil", async () => {
    const { loadGoogleMaps } = await fresh();
    const first = loadGoogleMaps();
    const second = loadGoogleMaps();
    expect(second).toBe(first);
    expect(scripts).toHaveLength(1);
    const src = scripts[0].getAttribute("src");
    expect(src).toContain("https://maps.googleapis.com/maps/api/js?");
    expect(src).toContain("key=kunci-tes");
    expect(src).toContain("callback=__tobaMapsReady");
    expect(scripts[0].async).toBe(true);

    const maps = { Map: function Map() {} };
    globalThis.google = { maps };
    globalThis.__tobaMapsReady();
    await expect(first).resolves.toBe(maps);
  });

  test("gagal memuat skrip -> ditolak LOAD_FAILED dan bisa dicoba lagi", async () => {
    const { loadGoogleMaps } = await fresh();
    const p = loadGoogleMaps();
    scripts[0].onerror();
    await expect(p).rejects.toThrow("LOAD_FAILED");
    loadGoogleMaps().catch(() => {});
    expect(scripts).toHaveLength(2);
  });

  test("gm_authFailure memberi tahu pendengar dan bisa berhenti mendengarkan", async () => {
    const { onMapsAuthFailure, isMapsAuthFailed } = await fresh();
    const a = vi.fn();
    const b = vi.fn();
    const offA = onMapsAuthFailure(a);
    onMapsAuthFailure(b);
    expect(isMapsAuthFailed()).toBe(false);
    globalThis.gm_authFailure();
    expect(isMapsAuthFailed()).toBe(true);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    expect(offA()).toBe(true);
    globalThis.gm_authFailure();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(2);
  });
});