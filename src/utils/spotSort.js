import { STATUS_META } from "../constants/status";
import { parseSqlDate } from "./date";

// Pantai tanpa data kedalaman diurutkan paling akhir.
const MAX_DEPTH = Number.MAX_SAFE_INTEGER;
const byName = (a, b) => a.nama_pantai.localeCompare(b.nama_pantai);
const statusOrder = (spot) => (STATUS_META[spot.current_status] ?? STATUS_META.AMAN).order;
const reportTime = (spot) => parseSqlDate(spot.kondisi_updated_at)?.getTime() ?? 0;

const COMPARATORS = {
  nama: byName,
  aman: (a, b) => statusOrder(a) - statusOrder(b) || byName(a, b),
  dangkal: (a, b) => (a.kedalaman_avg ?? MAX_DEPTH) - (b.kedalaman_avg ?? MAX_DEPTH),
  terbaru: (a, b) => reportTime(b) - reportTime(a),
};

// Mengembalikan salinan terurut; kunci tidak dikenal = urut nama.
export const sortSpots = (list, key = "nama") => [...list].sort(COMPARATORS[key] ?? byName);
