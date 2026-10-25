import { ref, reactive, computed, watch } from "vue";
import { getSpots } from "../services/spotApi";
import { describeError } from "../services/apiError";
import { EMPTY_FILTERS, hasActiveFilters } from "../utils/spotFilters";
import { sortSpots } from "../utils/spotSort";

export const spots = ref([]); // hasil setelah filter
export const allSpots = ref([]); // tanpa filter
export const loading = ref(false);
export const apiError = ref(null); // { kind, message, hint } atau null
export const filters = reactive({ ...EMPTY_FILTERS });
export const sortBy = ref("nama");

export const kabupatenList = computed(() =>
  [...new Set(allSpots.value.map((s) => s.kabupaten))].sort((a, b) => a.localeCompare(b, "id"))
);
export const filtersActive = computed(() => hasActiveFilters(filters));
export const sortedSpots = computed(() => sortSpots(spots.value, sortBy.value));

let requestSeq = 0; // Respons lama tidak boleh menimpa hasil permintaan terbaru.
let filterTimer = null;
const FILTER_DEBOUNCE_MS = 250;

export async function loadSpots() {
  const mine = ++requestSeq;
  loading.value = true;
  try {
    const [filteredRes, allRes] = await Promise.all([
      getSpots(filters),
      getSpots({}),
    ]);
    if (mine !== requestSeq) return;
    spots.value = filteredRes.data;
    allSpots.value = allRes.data;
    apiError.value = null;
  } catch (e) {
    if (mine !== requestSeq) return;
    apiError.value = describeError(e, "Gagal memuat data pantai.");
  } finally {
    if (mine === requestSeq) loading.value = false;
  }
}

export function resetFilters() {
  Object.assign(filters, EMPTY_FILTERS);
  sortBy.value = "nama";
}

export function dismissApiError() {
  apiError.value = null;
}

watch(filters, () => {
  loadSpots();
});