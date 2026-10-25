import { describe, test, expect } from "bun:test";
import { parseSqlDate, timeAgo, isSameWibDay, formatWib } from "../src/utils/date";

describe("parseSqlDate", () => {
  test("memahami format SQL YYYY-MM-DD HH:MM:SS sebagai UTC", () => {
    const d = parseSqlDate("2026-04-10 10:00:00");
    expect(d.toISOString()).toBe("2026-04-10T10:00:00.000Z");
  });

  test("mengembalikan null untuk input kosong atau cacat", () => {
    expect(parseSqlDate(null)).toBeNull();
    expect(parseSqlDate("bukan-tanggal")).toBeNull();
  });
});

describe("timeAgo", () => {
  test("menghasilkan teks relatif yang wajar", () => {
    const nowIso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(nowIso)).toMatch(/menit|baru/i);
    expect(timeAgo(null)).toBe("-");
  });
});

test("isSameWibDay memakai hari kalender WIB, bukan UTC", () => {
  // Pukul 18.00 UTC tanggal 1 = pukul 01.00 WIB tanggal 2
  const a = "2026-05-01 18:00:00";
  const b = "2026-05-02 02:00:00";
  expect(isSameWibDay(a, b)).toBe(true);
});

test("formatWib memberi akhiran WIB dan '-' untuk kosong", () => {
  expect(formatWib("2026-01-01 00:00:00")).toMatch(/WIB$/);
  expect(formatWib(null)).toBe("-");
});