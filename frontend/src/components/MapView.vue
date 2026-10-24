<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { loadGoogleMaps, hasMapsKey, onMapsAuthFailure, isMapsAuthFailed } from "../services/googleMaps";

const props = defineProps({ spots: { type: Array, default: () => [] } });
const emit = defineEmits(["select"]);

const mapEl = ref(null);
const problem = ref(""); // NO_KEY | AUTH_FAILED | LOAD_FAILED
const withoutCoords = ref(0);

const COLORS = { AMAN: "#1f9d55", WASPADA: "#f2b705", BAHAYA: "#d33a3a" };
const LABELS = { AMAN: "Aman Berenang", WASPADA: "Waspada", BAHAYA: "Bahaya / Tutup" };
const ZONE_RADIUS_M = 400; // lingkaran "radar" di sekitar titik pantai

let gm = null;
let map = null;
let infoWindow = null;
let overlays = [];
let offAuth = null;

function clearOverlays() {
  overlays.forEach((o) => o.setMap(null));
  overlays = [];
}

// Isi jendela info dibuat dengan DOM + textContent (bukan innerHTML) agar aman dari XSS.
function buildInfo(spot) {
  const root = document.createElement("div");
  root.style.cssText = "min-width:200px;font-family:system-ui,sans-serif;color:#17313e";
  const title = document.createElement("strong");
  title.textContent = spot.nama_pantai;
  const badge = document.createElement("div");
  badge.textContent = LABELS[spot.current_status] || spot.current_status;
  badge.style.cssText = `display:inline-block;margin:6px 0;padding:2px 10px;border-radius:999px;color:${spot.current_status === "WASPADA" ? "#17313e" : "#fff"};background:${COLORS[spot.current_status]};font-size:12px;font-weight:600`;
  const kab = document.createElement("div");
  kab.textContent = `Kabupaten ${spot.kabupaten}`;
  kab.style.cssText = "font-size:13px;margin-bottom:8px";
  const detail = document.createElement("button");
  detail.textContent = "Lihat detail";
  detail.style.cssText = "margin-right:8px;padding:5px 10px;border:0;border-radius:6px;background:#0b6e8f;color:#fff;cursor:pointer";
  detail.addEventListener("click", () => emit("select", spot.id));
  const link = document.createElement("a");
  link.textContent = "Buka di Google Maps";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.href = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
  link.style.cssText = "font-size:12px";
  root.append(title, document.createElement("br"), badge, kab, detail, link);
  return root;
}

function draw() {
  if (!map || problem.value) return;
  clearOverlays();
  const located = props.spots.filter((s) => s.latitude != null && s.longitude != null);
  withoutCoords.value = props.spots.length - located.length;

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
      infoWindow.setContent(buildInfo(spot));
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
  offAuth = onMapsAuthFailure(() => { problem.value = "AUTH_FAILED"; });

  if (!hasMapsKey()) { problem.value = "NO_KEY"; return; }
  if (isMapsAuthFailed()) { problem.value = "AUTH_FAILED"; return; }
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
    problem.value = "LOAD_FAILED";
  }
});

watch(() => props.spots, draw);
onBeforeUnmount(() => { offAuth?.(); clearOverlays(); infoWindow?.close(); });
</script>

<template>
  <div class="wrap">
    <div v-if="problem" class="card notice">
      <template v-if="problem === 'NO_KEY'">
        <strong>Peta belum aktif: API key Google Maps belum diisi.</strong>
        <p>Isi <code>VITE_GOOGLE_MAPS_API_KEY</code> di file <code>frontend/.env</code> dengan key asli (bukan teks contoh), lalu hentikan dan jalankan ulang <code>bun run dev</code>.</p>
      </template>
      <template v-else-if="problem === 'AUTH_FAILED'">
        <strong>Google Maps menolak API key Anda.</strong>
        <p>Buka Console browser (tekan F12), cari tulisan <code>Google Maps JavaScript API error</code>, lalu sesuaikan dengan nama error-nya:</p>
        <ul>
          <li><code>InvalidKeyMapError</code>: key salah ketik atau belum terbaca. Periksa <code>frontend/.env</code> dan restart server.</li>
          <li><code>ApiNotActivatedMapError</code>: aktifkan <b>Maps JavaScript API</b> di Google Cloud Console.</li>
          <li><code>BillingNotEnabledMapError</code>: pasang akun penagihan (billing) pada project.</li>
          <li><code>RefererNotAllowedMapError</code>: tambahkan <code>http://localhost:5173/*</code> pada pembatasan website key.</li>
        </ul>
      </template>
      <template v-else>
        <strong>Peta gagal dimuat.</strong>
        <p>Periksa koneksi internet lalu muat ulang halaman.</p>
      </template>
    </div>

    <div v-show="!problem" ref="mapEl" class="map" role="region" aria-label="Peta status pantai Danau Toba"></div>

    <div v-if="!problem" class="legend">
      <span><i :style="{ background: COLORS.AMAN }"></i> Aman Berenang</span>
      <span><i :style="{ background: COLORS.WASPADA }"></i> Waspada</span>
      <span><i :style="{ background: COLORS.BAHAYA }"></i> Bahaya / Tutup</span>
      <span v-if="withoutCoords" class="muted">{{ withoutCoords }} pantai belum memiliki koordinat</span>
    </div>
  </div>
</template>

<style scoped>
.map { width: 100%; height: 560px; border-radius: 12px; border: 1px solid var(--line); background: #dfeaf0; }
.legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 10px; font-size: .9rem; align-items: center; }
.legend i { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }
.notice code { background: #eef3f6; padding: 1px 6px; border-radius: 4px; }
.notice ul { padding-left: 20px; line-height: 1.7; }
@media (max-width: 600px) { .map { height: 420px; } }
</style>
