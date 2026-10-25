import { describe, test, expect } from "bun:test";
import { parseSqlDate, timeAgo, isSameWibDay, formatWib } from "../src/utils/date";

describe("parseSqlDate", () => {
  test("timestamp SQLite dianggap UTC", () => {
    expect(parseSqlDate("2026-01-01 00:00:00").toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });
  test("zona waktu eksplisit dipertahankan; nilai kosong/rusak -> null", () => {
    expect(parseSqlDate("2026-01-01T07:00:00+07:00").toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(parseSqlDate(null)).toBeNull();
    expect(parseSqlDate("bukan tanggal")).toBeNull();
  });
});

describe("timeAgo", () => {
  const now = Date.parse("2026-01-02T00:00:00Z");
  test("satuan waktu", () => {
    expect(timeAgo("2026-01-01 23:59:50", now)).toBe("baru saja");
    expect(timeAgo("2026-01-01 23:30:00", now)).toBe("30 menit lalu");
    expect(timeAgo("2026-01-01 20:00:00", now)).toBe("4 jam lalu");
    expect(timeAgo("2025-12-30 00:00:00", now)).toBe("3 hari lalu");
    expect(timeAgo(null, now)).toBe("");
  });
});

test("isSameWibDay memakai hari kalender WIB, bukan UTC", () => {
  const now = new Date("2026-01-02T03:00:00Z"); // 10:00 WIB tanggal 2
  expect(isSameWibDay("2026-01-01 18:00:00", now)).toBe(true); // 01:00 WIB tanggal 2
  expect(isSameWibDay("2026-01-01 10:00:00", now)).toBe(false); // 17:00 WIB tanggal 1
});

test("formatWib memberi akhiran WIB dan '-' untuk kosong", () => {
  expect(formatWib("2026-01-01 00:00:00")).toEndWith("WIB");
  expect(formatWib(null)).toBe("-");
});
