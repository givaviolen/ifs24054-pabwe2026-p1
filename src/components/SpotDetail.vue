<script setup>
import { ref, computed, watch } from "vue";
import { getSpot, describeError } from "../services/api";
import StatusBadge from "./StatusBadge.vue";
import { formatWib, timeAgo, STATUS_INFO } from "../utils/format";

const props = defineProps({ spotId: Number });
defineEmits(["close"]);

const spot = ref(null);
const error = ref(null);

async function load(id) {
  spot.value = null; error.value = null;
  try { spot.value = await getSpot(id); }
  catch (e) { error.value = describeError(e, "Gagal memuat detail pantai."); }
}
watch(() => props.spotId, load, { immediate: true });

const latest = computed(() => spot.value?.history?.[0] || null);
const advice = computed(() => STATUS_INFO[spot.value?.current_status]?.advice || "");
const hasCoords = computed(() => spot.value?.latitude != null && spot.value?.longitude != null);
const mapsUrl = computed(
  () => `https://www.google.com/maps/search/?api=1&query=${spot.value.latitude},${spot.value.longitude}`
);
</script>

<template>
  <section class="detail">
    <button class="ghost back" @click="$emit('close')">← Kembali</button>

    <div v-if="error" class="card">
      <p class="error"><strong>{{ error.message }}</strong></p>
      <p v-if="error.hint" class="muted">{{ error.hint }}</p>
      <button @click="load(spotId)">Coba lagi</button>
    </div>
    <div v-else-if="!spot" class="card skeleton" aria-busy="true"></div>

    <template v-else>
      <div class="card head">
        <div>
          <h2>{{ spot.nama_pantai }}</h2>
          <p class="muted">📍 Kabupaten {{ spot.kabupaten }}</p>
        </div>
        <StatusBadge :status="spot.current_status" />
      </div>

      <div class="advice" :class="spot.current_status.toLowerCase()">
        <strong>{{ STATUS_INFO[spot.current_status].icon }} {{ STATUS_INFO[spot.current_status].label }}</strong>
        <span>{{ advice }}</span>
      </div>

      <div class="two">
        <div class="card">
          <h3>Karakteristik &amp; Fasilitas</h3>
          <ul class="facts">
            <li><span>Kedalaman rata-rata tepi pantai</span><b>{{ spot.kedalaman_avg ?? "-" }} m</b></li>
            <li><span>Kontur</span><b>{{ spot.is_ramah_anak ? "Landai (ramah anak)" : "Dalam / curam" }}</b></li>
            <li><span>Pelampung</span><b>{{ spot.ada_pelampung ? "Tersedia" : "Tidak tersedia" }}</b></li>
          </ul>
          <a v-if="hasCoords" :href="mapsUrl" target="_blank" rel="noopener noreferrer" class="maplink">🗺️ Buka di Google Maps</a>
        </div>

        <div class="card">
          <h3>Kondisi Terkini</h3>
          <template v-if="latest">
            <ul class="facts">
              <li><span>Eceng gondok</span><b>{{ latest.kondisi_eceng_gondok }}</b></li>
              <li><span>Tinggi ombak</span><b>{{ latest.tinggi_ombak }}</b></li>
            </ul>
            <blockquote v-if="latest.catatan_petugas">“{{ latest.catatan_petugas }}”</blockquote>
            <p class="muted stamp">Diperbarui {{ formatWib(latest.updated_at) }} ({{ timeAgo(latest.updated_at) }})</p>
          </template>
          <p v-else class="muted">Belum ada laporan dari petugas untuk pantai ini.</p>
        </div>
      </div>

      <div class="card">
        <h3>Riwayat Laporan Petugas</h3>
        <p v-if="!spot.history.length" class="muted">Belum ada laporan.</p>
        <div v-else class="wrap">
          <table>
            <thead><tr><th>Waktu</th><th>Eceng gondok</th><th>Ombak</th><th>Catatan</th></tr></thead>
            <tbody>
              <tr v-for="h in spot.history" :key="h.id">
                <td>{{ formatWib(h.updated_at) }}</td><td>{{ h.kondisi_eceng_gondok }}</td>
                <td>{{ h.tinggi_ombak }}</td><td>{{ h.catatan_petugas || "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.detail { display: flex; flex-direction: column; gap: 16px; }
.back { align-self: flex-start; color: var(--accent); border-color: var(--accent); }
.head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
.head p { margin: 4px 0 0; }
.skeleton { height: 220px; }
.advice { display: flex; flex-direction: column; gap: 4px; padding: 14px 18px; border-radius: 14px; color: #fff; background: var(--aman); }
.advice.waspada { background: #8a6a00; }
.advice.bahaya { background: var(--bahaya); }
.advice span { font-size: .92rem; opacity: .95; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.facts { list-style: none; margin: 10px 0 0; padding: 0; }
.facts li { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); font-size: .92rem; }
.facts span { color: var(--muted); }
.maplink { display: inline-block; margin-top: 14px; font-size: .88rem; }
blockquote { margin: 14px 0 6px; padding: 10px 14px; border-left: 4px solid var(--ghost); background: #f2f8fa; border-radius: 0 10px 10px 0; font-size: .92rem; }
.stamp { margin: 6px 0 0; font-size: .8rem; }
.wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: .9rem; margin-top: 8px; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
@media (max-width: 720px) { .two { grid-template-columns: 1fr; } }
</style>
