import { ref, reactive, computed, watch } from "vue";
import { getSpots } from "../services/api";

// State data pantai yang dipakai bersama oleh Beranda, Daftar, Peta, dan Panel Petugas.
export const filters = reactive({ kabupaten: "", status: "", ada_pelampung: false, ramah_anak: false });
export const spots = ref([]); // hasil setelah filter
export const allSpots = ref([]); // tanpa filter
export const loading = ref(false);
export const error = ref("");

export const kabupatenList = computed(() =>
  [...new Set(allSpots.value.map((s) => s.kabupaten))].sort()
);
export const filtersActive = computed(
  () => !!(filters.kabupaten || filters.status || filters.ada_pelampung || filters.ramah_anak)
);

let seq = 0; // penanda permintaan terbaru, agar respons lama tidak menimpa yang baru

export async function loadSpots() {
  const mine = ++seq;
  loading.value = true;
  error.value = "";
  try {
    const params = {};
    if (filters.kabupaten) params.kabupaten = filters.kabupaten;
    if (filters.status) params.status = filters.status;
    if (filters.ada_pelampung) params.ada_pelampung = 1;
    if (filters.ramah_anak) params.ramah_anak = 1;
    const [filtered, all] = await Promise.all([getSpots(params), getSpots()]);
    if (mine !== seq) return;
    spots.value = filtered.data;
    allSpots.value = all.data;
  } catch {
    if (mine === seq) error.value = "Tidak dapat terhubung ke server API. Pastikan Back-End berjalan.";
  } finally {
    if (mine === seq) loading.value = false;
  }
}

export function resetFilters() {
  Object.assign(filters, { kabupaten: "", status: "", ada_pelampung: false, ramah_anak: false });
}

// Setiap filter berubah -> ambil ulang data dari API.
watch(filters, loadSpots, { deep: true });
