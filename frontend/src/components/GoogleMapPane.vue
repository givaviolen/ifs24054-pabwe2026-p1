<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { loadGoogleMaps, hasMapsKey, onMapsAuthFailure, isMapsAuthFailed } from "../services/googleMaps";
import { COLORS, LABELS, ZONE_RADIUS_M, buildSpotInfo } from "../utils/mapShared";

// Peta Google Maps. Bila key belum ada / ditolak / gagal dimuat, memberi tahu induk lewat "failed".
const props = defineProps({ spots: { type: Array, default: () => [] } });
const emit = defineEmits(["select", "failed"]);

const mapEl = ref(null);
let gm = null;
let map = null;
let infoWindow = null;
let overlays = [];
let offAuth = null;
let failedOnce = false;

function fail(reason) {
  if (failedOnce) return;
  failedOnce = true;
  emit("failed", reason);
}

function clearOverlays() {
  overlays.forEach((o) => o.setMap(null));
  overlays = [];
}

function draw() {
  if (!map) return;
  clearOverlays();
  const located = props.spots.filter((s) => s.latitude != null && s.longitude != null);
  const bounds = new gm.LatLngBounds();
  for (const spot of located) {
    const color = COLORS[spot.current_status] || COLORS.AMAN;
    const position = { lat: spot.latitude, lng: spot.longitude };
    const zone = new gm.Circle({
      map, center: position, radius: ZONE_RADIUS_M, clickable: false,
      fillColor: color, fillOpacity: 0.2, strokeColor: color, strokeOpacity: 0.7, strokeWeight: 1,
    });
    const marker = new gm.Marker({
      map, position, title: `${spot.nama_pantai} - ${LABELS[spot.current_status]}`,
      icon: { path: gm.SymbolPath.CIRCLE, scale: 10, fillColor: color, fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 },
    });
    marker.addListener("click", () => {
      infoWindow.setContent(buildSpotInfo(spot, (id) => emit("select", id)));
      infoWindow.open({ map, anchor: marker });
    });
    overlays.push(zone, marker);
    bounds.extend(position);
  }
  if (located.length > 1) map.fitBounds(bounds, 48);
  else if (located.length === 1) { map.setCenter(bounds.getCenter()); map.setZoom(13); }
}

onMounted(async () => {
  // Google memberi tahu penolakan key lewat callback global, sering setelah peta sempat dibuat.
  offAuth = onMapsAuthFailure(() => fail("AUTH_FAILED"));
  if (!hasMapsKey()) return fail("NO_KEY");
  if (isMapsAuthFailed()) return fail("AUTH_FAILED");
  try {
    gm = await loadGoogleMaps();
    map = new gm.Map(mapEl.value, {
      center: { lat: 2.65, lng: 98.9 }, // Danau Toba
      zoom: 9,
      mapTypeId: "terrain",
      streetViewControl: false,
      fullscreenControl: true,
    });
    infoWindow = new gm.InfoWindow();
    draw();
  } catch {
    fail("LOAD_FAILED");
  }
});

watch(() => props.spots, draw);
onBeforeUnmount(() => { offAuth?.(); clearOverlays(); infoWindow?.close(); });
</script>

<template>
  <div ref="mapEl" class="map" role="region" aria-label="Peta status pantai Danau Toba"></div>
</template>

<style scoped>
.map { width: 100%; height: 560px; border-radius: 16px; border: 1px solid var(--line); background: #dfeaf0; position: relative; z-index: 0; isolation: isolate; }
@media (max-width: 600px) { .map { height: 420px; } }
</style>