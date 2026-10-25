import { sortSpots } from "./spotSort";

// Pencarian lokal (tanpa request) pada nama pantai atau kabupaten, hasil urut nama.
export function searchSpots(list, query = "") {
  const q = query.trim().toLowerCase();
  const sorted = sortSpots(list, "nama");
  return q ? sorted.filter((s) => `${s.nama_pantai} ${s.kabupaten}`.toLowerCase().includes(q)) : sorted;
}
