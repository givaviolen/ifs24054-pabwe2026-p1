import { describe, test, expect } from "bun:test";
import { parseSqlDate, timeAgo, isSameWibDay, formatWib } from "../src/utils/date";
import { parsePath, hashToPath, AUTH_PAGES, AUTH, PROTECTED, parseRoute } from "../src/utils/route";
import { buildSpotParams, hasActiveFilters, EMPTY_FILTERS } from "../src/utils/spotFilters";
import { toSpotPayload } from "../src/utils/spotForm";
import { sortSpots } from "../src/utils/spotSort";
import { deriveStatus } from "../src/utils/status";

const ago = (sec) => new Date(Date.now() - sec * 1000);

describe("date (cabang tambahan)", () => {
  test("parseSqlDate: bukan string, ISO valid, dan format T", () => {
    expect(parseSqlDate(123)).toBeNull();
    expect(parseSqlDate("2026-04-10T10:00:00Z").toISOString()).toBe("2026-04-10T10:00:00.000Z");
    expect(parseSqlDate("2026-04-10T10:00:00").toISOString()).toBe("2026-04-10T10:00:00.000Z");
    expect(parseSqlDate("2026-04-10").toISOString()).toBe("2026-04-10T00:00:00.000Z");
  });
  test("timeAgo: semua rentang waktu dan input tidak valid", () => {
    expect(timeAgo(ago(10))).toBe("baru saja");
    expect(timeAgo(ago(120))).toBe("2 menit lalu");
    expect(timeAgo(ago(7200))).toBe("2 jam lalu");
    expect(timeAgo(ago(172800))).toBe("2 hari lalu");
    expect(timeAgo("")).toBe("-");
    expect(timeAgo("bukan-tanggal")).toBe("-");
  });
  test("isSameWibDay: input kosong/tidak valid, objek Date, dan hari berbeda", () => {
    expect(isSameWibDay(null, new Date())).toBe(false);
    expect(isSameWibDay("bukan-tanggal", new Date())).toBe(false);
    expect(isSameWibDay(new Date(), new Date())).toBe(true);
    expect(isSameWibDay(new Date())).toBe(true);
    expect(isSameWibDay("2026-05-01 00:00:00", "2026-05-09 00:00:00")).toBe(false);
  });
  test("formatWib: objek Date dan string tidak valid", () => {
    expect(formatWib(new Date("2026-01-01T00:00:00Z"))).toMatch(/WIB$/);
    expect(formatWib("bukan-tanggal")).toBe("-");
  });
});

describe("route (cabang tambahan)", () => {
  test("AUTH_PAGES / AUTH .has", () => {
    expect(AUTH_PAGES.has("login")).toBe(true);
    expect(AUTH.has("register")).toBe(true);
    expect(AUTH.has("home")).toBe(false);
    expect(PROTECTED.has("admin")).toBe(true);
  });
  test("parsePath: path kosong, trailing slash, query, dan rute edit pantai", () => {
    expect(parsePath("")).toEqual({ name: "notfound", query: {} });
    expect(parsePath("/daftar/").name).toBe("list");
    expect(parsePath("/peta?a=1&b=2").query).toEqual({ a: "1", b: "2" });
    expect(parsePath("/petugas/pantai/7")).toMatchObject({ name: "admin-spots", editId: 7 });
    expect(parsePath("/petugas/pantai/tambah").name).toBe("admin-spot-new");
    expect(parsePath("/petugas/kondisi").name).toBe("admin-log");
    expect(parseRoute).toBe(parsePath);
  });
  test("hashToPath: bukan string", () => {
    expect(hashToPath(123)).toBeNull();
  });
  test("tanpa argumen di lingkungan tanpa window (Node)", () => {
    expect(hashToPath()).toBeNull();
    expect(parsePath().name).toBe("home");
  });
});

describe("filter, form, sort, status (cabang tambahan)", () => {
  test("buildSpotParams: semua filter terisi", () => {
    expect(buildSpotParams({ q: "a", kabupaten: "Toba", status: "AMAN", ada_pelampung: true, ramah_anak: true }))
      .toEqual({ q: "a", kabupaten: "Toba", status: "AMAN", ada_pelampung: 1, ramah_anak: 1 });
    expect(hasActiveFilters({ ...EMPTY_FILTERS, kabupaten: "Toba" })).toBe(true);
  });
  test("toSpotPayload: null, string kosong, dan checkbox aktif", () => {
    const base = { kedalaman_avg: null, latitude: "", longitude: null, is_ramah_anak: false, ada_pelampung: true };
    expect(toSpotPayload(base)).toMatchObject({ kedalaman_avg: null, latitude: null, longitude: null, is_ramah_anak: 0, ada_pelampung: 1 });
  });
  test("sortSpots: status tidak dikenal, kedalaman null di kedua sisi, laporan kosong", () => {
    const a = { nama_pantai: "A", current_status: "ASING", kedalaman_avg: null, kondisi_updated_at: null };
    const b = { nama_pantai: "B", current_status: "AMAN", kedalaman_avg: null, kondisi_updated_at: null };
    const c = { nama_pantai: "C", current_status: "BAHAYA", kedalaman_avg: 2, kondisi_updated_at: "2026-01-01 10:00:00" };
    expect(sortSpots([b, a], "aman").map((s) => s.nama_pantai)).toEqual(["A", "B"]);
    expect(sortSpots([c, b, a], "dangkal").map((s) => s.nama_pantai)).toEqual(["C", "B", "A"]);
    expect(sortSpots([b, c], "terbaru").map((s) => s.nama_pantai)).toEqual(["C", "B"]);
    expect(sortSpots([c, b]).map((s) => s.nama_pantai)).toEqual(["B", "C"]);
  });
  test("deriveStatus: kombinasi lain", () => {
    expect(deriveStatus("Pekat", "Tinggi")).toBe("BAHAYA");
    expect(deriveStatus("Sedang", "Sedang")).toBe("WASPADA");
    expect(deriveStatus("Bersih", "Bersih")).toBe("AMAN");
  });
});