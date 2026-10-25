import { describe, test, expect } from "bun:test";
import { sortSpots } from "../src/utils/spotSort";
import { searchSpots } from "../src/utils/spotSearch";
import { buildSpotParams, hasActiveFilters, EMPTY_FILTERS } from "../src/utils/spotFilters";
import { summarizeSpots, recentReports, showcaseSpots, reportedToday } from "../src/utils/spotStats";
import { toSpotPayload } from "../src/utils/spotForm";

const spot = (over) => ({ id: 1, nama_pantai: "A", kabupaten: "Toba", current_status: "AMAN", kedalaman_avg: 2, kondisi_updated_at: null, ...over });
const LIST = [
  spot({ id: 1, nama_pantai: "Cemara", current_status: "BAHAYA", kedalaman_avg: 3, kondisi_updated_at: "2026-01-01 10:00:00" }),
  spot({ id: 2, nama_pantai: "Aman Jaya", current_status: "AMAN", kedalaman_avg: null }),
  spot({ id: 3, nama_pantai: "Bukit", kabupaten: "Samosir", current_status: "WASPADA", kedalaman_avg: 1, kondisi_updated_at: "2026-01-02 10:00:00" }),
];
const names = (list) => list.map((s) => s.nama_pantai);

describe("sortSpots", () => {
  test("nama, aman, dangkal, terbaru; input tidak diubah", () => {
    const copy = [...LIST];
    expect(names(sortSpots(LIST, "nama"))).toEqual(["Aman Jaya", "Bukit", "Cemara"]);
    expect(names(sortSpots(LIST, "aman"))).toEqual(["Aman Jaya", "Bukit", "Cemara"]);
    expect(names(sortSpots(LIST, "dangkal"))).toEqual(["Bukit", "Cemara", "Aman Jaya"]); // tanpa data = terakhir
    expect(names(sortSpots(LIST, "terbaru"))[0]).toBe("Bukit");
    expect(LIST).toEqual(copy);
  });
  test("kunci tidak dikenal = urut nama", () => {
    expect(names(sortSpots(LIST, "ngawur"))).toEqual(["Aman Jaya", "Bukit", "Cemara"]);
  });
});

test("searchSpots mencari nama atau kabupaten tanpa peka huruf besar/kecil", () => {
  expect(names(searchSpots(LIST, " samosir "))).toEqual(["Bukit"]);
  expect(names(searchSpots(LIST, "CEM"))).toEqual(["Cemara"]);
  expect(searchSpots(LIST, "").length).toBe(3);
});

describe("filter", () => {
  test("hanya filter terisi yang menjadi parameter", () => {
    expect(buildSpotParams(EMPTY_FILTERS)).toEqual({});
    expect(buildSpotParams({ ...EMPTY_FILTERS, q: " toba ", status: "AMAN", ramah_anak: true }))
      .toEqual({ q: "toba", status: "AMAN", ramah_anak: 1 });
  });
  test("hasActiveFilters", () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, ada_pelampung: true })).toBe(true);
  });
});

describe("spotStats", () => {
  const now = new Date("2026-01-02T05:00:00Z"); // 12:00 WIB tanggal 2
  test("summarizeSpots", () => {
    const s = summarizeSpots(LIST, now);
    expect(s).toMatchObject({ total: 3, kabupaten: 2, needAttention: 2, notReportedToday: 2 });
    expect(s.byStatus).toEqual({ AMAN: 1, WASPADA: 1, BAHAYA: 1 });
  });
  test("recentReports hanya yang pernah dilaporkan, terbaru dulu", () => {
    expect(names(recentReports(LIST))).toEqual(["Bukit", "Cemara"]);
    expect(recentReports(LIST, 1).length).toBe(1);
  });
  test("showcaseSpots mulai dari yang paling aman dan dibatasi jumlahnya", () => {
    expect(showcaseSpots(LIST, 2)[0].nama_pantai).toBe("Aman Jaya");
    expect(showcaseSpots(LIST, 2).length).toBe(2);
  });
  test("reportedToday", () => {
    expect(reportedToday(LIST[2], now)).toBe(true);
    expect(reportedToday(LIST[0], now)).toBe(false);
    expect(reportedToday(LIST[1], now)).toBe(false);
  });
});

test("toSpotPayload mengubah teks kosong menjadi null dan checkbox menjadi 0/1", () => {
  const form = { nama_pantai: "X", kabupaten: "Y", kedalaman_avg: "1.5", is_ramah_anak: true, ada_pelampung: false, current_status: "AMAN", latitude: "", longitude: "98.9" };
  expect(toSpotPayload(form)).toMatchObject({ kedalaman_avg: 1.5, latitude: null, longitude: 98.9, is_ramah_anak: 1, ada_pelampung: 0 });
});
