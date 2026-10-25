import { ref, reactive, computed, watch } from "vue";
import { getSpots } from "../services/spotApi";
import { describeError } from "../services/apiError";
import { sortSpots } from "../utils/spotSort";
import { EMPTY_FILTERS, buildSpotParams, hasActiveFilters } from "../utils/spotFilters";

const FILTER_DEBOUNCE_MS = 250;

// State data pantai yang dipakai bersama oleh Beranda, Daftar, Peta, dan Panel Petugas.
export const filters = reactive({ ...EMPTY_FILTERS });
export const sortBy = ref("nama"); // nama | aman | dangkal | terbaru (hanya urutan tampilan, tanpa request baru)
export const spots = ref([]); // hasil setelah filter
export const allSpots = ref([]); // tanpa filter
export const loading = ref(false);
export const apiError = ref(null); // { kind, message, hint } atau null

export const kabupatenList = computed(() => [...new Set(allSpots.value.map((s) => s.kabupaten))].sort());
export const filtersActive = computed(() => hasActiveFilters(filters));
export const sortedSpots = computed(() => sortSpots(spots.value, sortBy.value));

let requestSeq = 0; // penanda permintaan terbaru, agar respons lama tidak menimpa yang baru

export async function loadSpots() {
  const mine = ++requestSeq;
  loading.value = true;
  try {
    const params = buildSpotParams(filters);
    let filtered, all;
    if (Object.keys(params).length) [filtered, all] = await Promise.all([getSpots(params), getSpots()]);
    else filtered = all = await getSpots(); // tanpa filter: cukup satu permintaan
    if (mine !== requestSeq) return;
    spots.value = filtered.data;
    allSpots.value = all.data;
    apiError.value = null;
  } catch (e) {
    if (mine === requestSeq) apiError.value = describeError(e, "Gagal memuat data pantai.");
  } finally {
    if (mine === requestSeq) loading.value = false;
  }
}

export const dismissApiError = () => { apiError.value = null; };

export function resetFilters() {
  Object.assign(filters, EMPTY_FILTERS);
}

// Setiap filter berubah -> ambil ulang data dari API (ditunda sebentar agar pengetikan tidak memicu banyak request).
let debounceTimer;
watch(filters, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadSpots, FILTER_DEBOUNCE_MS);
}, { deep: true });
