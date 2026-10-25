<script setup>
import { ref, computed, defineAsyncComponent } from "vue";
import { hasMapsKey, isMapsAuthFailed } from "../../services/googleMaps";
import { COLORS } from "../../utils/mapShared";

// Lazy-load komponen map agar leaflet.js tidak membebani halaman lain
const GoogleMapPane = defineAsyncComponent(() => import("./GoogleMapPane.vue"));
const LeafletMapPane = defineAsyncComponent(() => import("./LeafletMapPane.vue"));

const props = defineProps({ spots: { type: Array, default: () => [] } });
const emit = defineEmits(["select"]);

const keyOk = hasMapsKey();
const provider = ref(keyOk && !isMapsAuthFailed() ? "google" : "osm");

function initialReason() {
  if (!keyOk) return "NO_KEY";
  return isMapsAuthFailed() ? "AUTH_FAILED" : "";
}
const reason = ref(initialReason());

function googleFailed(why) {
  reason.value = why;
  provider.value = "osm";
}

const withoutCoords = computed(
  () => props.spots.filter((s) => s.latitude == null || s.longitude == null).length
);

const notes = {
  NO_KEY: "Menampilkan peta OpenStreetMap karena API key Google Maps belum diisi di file .env.",
  AUTH_FAILED: "Menampilkan peta OpenStreetMap karena Google Maps menolak API key.",
  LOAD_FAILED: "Menampilkan peta OpenStreetMap karena Google Maps gagal dimuat.",
};
</script>

<template>
  <div>
    <GoogleMapPane v-if="provider === 'google'" :spots="spots" @select="emit('select', $event)" @failed="googleFailed" />
    <LeafletMapPane v-else :spots="spots" @select="emit('select', $event)" />

    <div class="legend">
      <span><i :style="{ background: COLORS.AMAN }"></i> Aman Berenang</span>
      <span><i :style="{ background: COLORS.WASPADA }"></i> Waspada</span>
      <span><i :style="{ background: COLORS.BAHAYA }"></i> Bahaya / Tutup</span>
      <span v-if="withoutCoords" class="muted">{{ withoutCoords }} pantai belum memiliki koordinat</span>
    </div>
    <p v-if="provider === 'osm' && reason" class="muted note">{{ notes[reason] }}</p>
  </div>
</template>

<style scoped>
.legend { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 12px; font-size: .9rem; align-items: center; }
.legend i { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }
.note { margin: 8px 0 0; font-size: .82rem; }
</style>