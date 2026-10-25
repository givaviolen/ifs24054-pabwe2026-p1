// Mengubah state filter UI menjadi parameter query API (hanya yang terisi).
export const EMPTY_FILTERS = { q: "", kabupaten: "", status: "", ada_pelampung: false, ramah_anak: false };

export function buildSpotParams(filters) {
  const params = {};
  if (filters.q.trim()) params.q = filters.q.trim();
  if (filters.kabupaten) params.kabupaten = filters.kabupaten;
  if (filters.status) params.status = filters.status;
  if (filters.ada_pelampung) params.ada_pelampung = 1;
  if (filters.ramah_anak) params.ramah_anak = 1;
  return params;
}

export const hasActiveFilters = (filters) => Object.keys(buildSpotParams(filters)).length > 0;
