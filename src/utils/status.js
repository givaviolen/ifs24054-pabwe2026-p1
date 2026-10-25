// Aturan status otomatis dari log harian; sama dengan statusService.js di Back-End.
// Dipakai untuk pratinjau di formulir sebelum disimpan.
export function deriveStatus(eceng, ombak) {
  if (eceng === "Pekat" || ombak === "Tinggi") return "BAHAYA";
  if (eceng === "Sedang" || ombak === "Sedang") return "WASPADA";
  return "AMAN";
}
