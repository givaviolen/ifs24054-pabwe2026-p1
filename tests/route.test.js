import { describe, test, expect } from "bun:test";
import { parsePath, hashToPath, PROTECTED } from "../src/utils/route";

describe("parsePath", () => {
  test("halaman publik", () => {
    expect(parsePath("/").name).toBe("home");
    expect(parsePath("/beranda").name).toBe("home");
    expect(parsePath("/daftar").name).toBe("list");
    expect(parsePath("/peta").name).toBe("map");
    expect(parsePath("/auth/login").name).toBe("login");
    expect(parsePath("/auth/register").name).toBe("register");
  });
  test("detail pantai membaca id numerik dan query", () => {
    expect(parsePath("/pantai/5?x=1")).toMatchObject({ name: "detail", id: 5, query: { x: "1" } });
    expect(parsePath("/pantai/abc").name).toBe("notfound");
    expect(parsePath("/pantai/5/lebih").name).toBe("notfound");
  });
  test("halaman petugas dilindungi", () => {
    for (const path of ["/petugas", "/petugas/pantai", "/petugas/pantai/tambah", "/petugas/kondisi"]) {
      expect(PROTECTED.has(parsePath(path).name)).toBe(true);
    }
    expect(PROTECTED.has(parsePath("/daftar").name)).toBe(false);
  });
  test("alamat tidak dikenal -> notfound", () => {
    expect(parsePath("/tidak-ada").name).toBe("notfound");
    expect(parsePath("/petugas/rahasia").name).toBe("notfound");
  });
});

test("hashToPath mengubah #/peta menjadi /peta", () => {
  expect(hashToPath("#/peta")).toBe("/peta");
  expect(hashToPath("#bagian")).toBeNull();
  expect(hashToPath("")).toBeNull();
});
