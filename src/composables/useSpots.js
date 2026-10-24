import { ref, reactive, computed, watch } from "vue";
import { getSpots, describeError } from "../services/api";
import { parseSqlDate } from "../utils/format";

// State data pantai yang dipakai bersama oleh Beranda, Daftar, Peta, dan Panel Petugas.
const EMPTY_FILTERS = { q: "", kabupaten: "", status: "", ada_pelampung: false, ramah_anak: false };
export const filters = reactive({ ...EMPTY_FILTERS });
export const sortBy = ref("nama"); // nama | aman | dangkal | terbaru (hanya urutan tampilan, tanpa request baru)
export const spots = ref([]); // hasil setelah filter
export const allSpots = ref([]); // tanpa filter
export const loading = ref(false);
export const apiError = ref(null); // { kind, message, hint } atau null

export const kabupatenList = computed(() =>
  [...new Set(allSpots.value.map((s) => s.kabupaten))].sort()
);
export const filtersActive = computed(
  () => !!(filters.q || filters.kabupaten || filters.status || filters.ada_pelampung || filters.ramah_anak)
);

const ORDER = { AMAN: 0, WASPADA: 1, BAHAYA: 2 };
export const sortedSpots = computed(() => {
  const list = [...spots.value];
  switch (sortBy.value) {
    case "aman": return list.sort((a, b) => ORDER[a.current_status] - ORDER[b.current_status] || a.nama_pantai.localeCompare(b.nama_pantai));
    case "dangkal": return list.sort((a, b) => (a.kedalaman_avg ?? 99) - (b.kedalaman_avg ?? 99));
    case "terbaru": return list.sort((a, b) => (parseSqlDate(b.kondisi_updated_at)?.getTime() ?? 0) - (parseSqlDate(a.kondisi_updated_at)?.getTime() ?? 0));
    default: return list.sort((a, b) => a.nama_pantai.localeCompare(b.nama_pantai));
  }
});

let seq = 0; // penanda permintaan terbaru, agar respons lama tidak menimpa yang baru

export async function loadSpots() {
  const mine = ++seq;
  loading.value = true;
  try {
    const params = {};
    if (filters.q.trim()) params.q = filters.q.trim();
    if (filters.kabupaten) params.kabupaten = filters.kabupaten;
    if (filters.status) params.status = filters.status;
    if (filters.ada_pelampung) params.ada_pelampung = 1;
    if (filters.ramah_anak) params.ramah_anak = 1;

    let filtered, all;
    if (Object.keys(params).length) [filtered, all] = await Promise.all([getSpots(params), getSpots()]);
    else filtered = all = await getSpots(); // tanpa filter: cukup satu permintaan
    if (mine !== seq) return;
    spots.value = filtered.data;
    allSpots.value = all.data;
    apiError.value = null;
  } catch (e) {
    if (mine === seq) apiError.value = describeError(e, "Gagal memuat data pantai.");
  } finally {
    if (mine === seq) loading.value = false;
  }
}

export const dismissApiError = () => { apiError.value = null; };

export function resetFilters() {
  Object.assign(filters, EMPTY_FILTERS);
}

// Setiap filter berubah -> ambil ulang data dari API (ditunda sebentar agar pengetikan tidak memicu banyak request).
let timer;
watch(filters, () => {
  clearTimeout(timer);
  timer = setTimeout(loadSpots, 250);
}, { deep: true });
