import { describe, test, expect, vi, afterEach } from "vitest";
import { getToken, setToken } from "../src/services/tokenStorage";
import { hashToPath, parsePath } from "../src/utils/route";

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("tokenStorage saat localStorage ditolak browser", () => {
  const blocked = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); },
  };

  test("getToken mengembalikan null", () => {
    vi.stubGlobal("localStorage", blocked);
    expect(getToken()).toBeNull();
  });

  test("setToken (simpan maupun hapus) tidak melempar error", () => {
    vi.stubGlobal("localStorage", blocked);
    expect(() => setToken("abc")).not.toThrow();
    expect(() => setToken(null)).not.toThrow();
  });
});

describe("utils/route tanpa window.location", () => {
  test("hashToPath dan parsePath memakai nilai bawaan yang aman", () => {
    vi.stubGlobal("location", undefined);
    expect(hashToPath()).toBeNull();
    expect(parsePath()).toMatchObject({ name: "home", query: {} });
  });

  test("path kosong sebelum tanda tanya dianggap beranda", () => {
    expect(parsePath("?x=1")).toEqual({ name: "home", query: { x: "1" } });
  });
});