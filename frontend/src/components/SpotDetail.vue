<script setup>
import { ref, watch } from "vue";
import { getSpot } from "../services/api";
import StatusBadge from "./StatusBadge.vue";

const props = defineProps({ spotId: Number });
defineEmits(["close"]);

const spot = ref(null);
const error = ref("");

watch(() => props.spotId, async (id) => {
  spot.value = null; error.value = "";
  try { spot.value = await getSpot(id); }
  catch { error.value = "Gagal memuat detail pantai."; }
}, { immediate: true });

const fmt = (s) => (s ? new Date(s.replace(" ", "T") + "Z").toLocaleString("id-ID") : "-");
</script>

<template>
  <section class="card">
    <button class="ghost" @click="$emit('close')">← Kembali</button>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="!spot" class="muted">Memuat…</p>
    <div v-else>
      <h2>{{ spot.nama_pantai }} <StatusBadge :status="spot.current_status" /></h2>
      <p class="muted">Kabupaten {{ spot.kabupaten }}</p>
      <h3>Karakteristik &amp; Fasilitas</h3>
      <ul>
        <li>Kedalaman rata-rata tepi pantai: {{ spot.kedalaman_avg ?? "-" }} m</li>
        <li>Kontur: {{ spot.is_ramah_anak ? "landai (ramah anak)" : "dalam / curam" }}</li>
        <li>Pelampung: {{ spot.ada_pelampung ? "tersedia" : "tidak tersedia" }}</li>
      </ul>
      <h3>Riwayat Laporan Petugas</h3>
      <p v-if="!spot.history.length" class="muted">Belum ada laporan.</p>
      <table v-else>
        <thead><tr><th>Waktu</th><th>Eceng gondok</th><th>Ombak</th><th>Catatan</th></tr></thead>
        <tbody>
          <tr v-for="h in spot.history" :key="h.id">
            <td>{{ fmt(h.updated_at) }}</td><td>{{ h.kondisi_eceng_gondok }}</td>
            <td>{{ h.tinggi_ombak }}</td><td>{{ h.catatan_petugas || "-" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
table { width: 100%; border-collapse: collapse; font-size: .9rem; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--line); }
h2 { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 12px; }
</style>
