import { describe, test, expect } from "bun:test";
import { deriveStatus } from "../src/utils/status";
import { STATUS_META, STATUS_KEYS, statusMeta } from "../src/constants/status";

test("deriveStatus mengikuti aturan Back-End", () => {
  expect(deriveStatus("Bersih", "Tenang")).toBe("AMAN");
  expect(deriveStatus("Sedang", "Tenang")).toBe("WASPADA");
  expect(deriveStatus("Bersih", "Sedang")).toBe("WASPADA");
  expect(deriveStatus("Pekat", "Tenang")).toBe("BAHAYA");
  expect(deriveStatus("Bersih", "Tinggi")).toBe("BAHAYA");
});

describe("STATUS_META", () => {
  test("setiap status punya data lengkap dan urutan unik", () => {
    for (const key of STATUS_KEYS) {
      const meta = STATUS_META[key];
      for (const field of ["label", "icon", "cardIcon", "cssVar", "mapColor", "advice"]) expect(meta[field]).toBeTruthy();
    }
    expect(new Set(STATUS_KEYS.map((k) => STATUS_META[k].order)).size).toBe(STATUS_KEYS.length);
  });
  test("status tidak dikenal jatuh ke AMAN", () => {
    expect(statusMeta("ASING")).toBe(STATUS_META.AMAN);
  });
});
