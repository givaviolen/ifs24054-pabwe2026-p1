import { STATUS_KEYS } from "../constants/status";
import { sortSpots } from "./spotSort";
import { isSameWibDay, parseSqlDate } from "./date";

// Ringkasan angka dari daftar pantai (dipakai Beranda dan Panel Petugas).
export function summarizeSpots(list, now = new Date()) {
  const byStatus = Object.fromEntries(STATUS_KEYS.map((k) => [k, list.filter((s) => s.current_status === k).length]));
  return {
    total: list.length,
    kabupaten: new Set(list.map((s) => s.kabupaten)).size,
    byStatus,
    needAttention: byStatus.WASPADA + byStatus.BAHAYA,
    notReportedToday: list.filter((s) => !isSameWibDay(s.kondisi_updated_at, now)).length,
  };
}

// Laporan terbaru lebih dulu; pantai tanpa laporan tidak ikut.
export const recentReports = (list, limit = 5) =>
  sortSpots(list.filter((s) => s.kondisi_updated_at), "terbaru").slice(0, limit);

// Sorotan Beranda: urut dari yang paling aman.
export const showcaseSpots = (list, limit = 8) => sortSpots(list, "aman").slice(0, limit);

export const reportedToday = (spot, now = new Date()) =>
  Boolean(parseSqlDate(spot.kondisi_updated_at)) && isSameWibDay(spot.kondisi_updated_at, now);
