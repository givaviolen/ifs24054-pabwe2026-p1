<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COLORS, ZONE_RADIUS_M, buildSpotInfo } from "../../utils/mapShared";

// Peta OpenStreetMap (tanpa API key). Dipakai bila Google Maps belum diatur atau ditolak.
const props = defineProps({ spots: { type: Array, default: () => [] } });
const emit = defineEmits(["select"]);

const mapEl = ref(null);
let map = null;
let layer = null;

function draw() {
  if (!map) return;
  layer.clearLayers();
  const points = [];
  for (const spot of props.spots) {
    if (spot.latitude == null || spot.longitude == null) continue;
    const color = COLORS[spot.current_status] || COLORS.AMAN;
    const at = [spot.latitude, spot.longitude];
    L.circle(at, {
      radius: ZONE_RADIUS_M, color, weight: 1, opacity: 0.7,
      fillColor: color, fillOpacity: 0.2, interactive: false,
    }).addTo(layer);
    L.circleMarker(at, {
      radius: 10, color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 1,
    }).bindPopup(buildSpotInfo(spot, (id) => emit("select", id))).addTo(layer);
    points.push(at);
  }
  if (points.length > 1) map.fitBounds(points, { padding: [40, 40] });
  else if (points.length === 1) map.setView(points[0], 13);
}

onMounted(() => {
  map = L.map(mapEl.value).setView([2.65, 98.9], 9); // Danau Toba
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);
  layer = L.layerGroup().addTo(map);
  draw();
  setTimeout(() => map && map.invalidateSize(), 0);
});

watch(() => props.spots, draw);
onBeforeUnmount(() => { map?.remove(); map = null; });
</script>

<template>
  <section ref="mapEl" class="map" aria-label="Peta status pantai Danau Toba"></section>
</template>

<style scoped>
/* isolation: agar lapisan peta tidak menutupi navbar saat halaman di-scroll */
.map { width: 100%; height: 560px; border-radius: 16px; border: 1px solid var(--line); background: #dfeaf0; position: relative; z-index: 0; isolation: isolate; }
@media (max-width: 600px) { .map { height: 420px; } }
</style>