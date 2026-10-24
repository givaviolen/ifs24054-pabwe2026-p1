<script setup>
import StatusBadge from "./StatusBadge.vue";
defineProps({ spot: { type: Object, required: true } });
defineEmits(["select"]);
</script>

<template>
  <article class="card spot" @click="$emit('select', spot.id)">
    <div class="top">
      <h3>{{ spot.nama_pantai }}</h3>
      <StatusBadge :status="spot.current_status" />
    </div>
    <p class="muted">Kabupaten {{ spot.kabupaten }}</p>
    <ul>
      <li>Kedalaman rata-rata: {{ spot.kedalaman_avg ?? "-" }} m</li>
      <li>{{ spot.is_ramah_anak ? "✅ Ramah anak" : "⚠️ Kurang cocok untuk anak" }}</li>
      <li>{{ spot.ada_pelampung ? "🛟 Ada pelampung" : "Tidak ada pelampung" }}</li>
    </ul>
    <p v-if="spot.kondisi_updated_at" class="muted">
      Eceng gondok: {{ spot.kondisi_eceng_gondok }} · Ombak: {{ spot.tinggi_ombak }}
    </p>
    <p v-else class="muted">Belum ada laporan harian.</p>
  </article>
</template>

<style scoped>
.spot { cursor: pointer; transition: box-shadow .15s; }
.spot:hover { box-shadow: 0 4px 14px rgba(0,0,0,.08); }
.top { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
h3 { font-size: 1.05rem; }
ul { padding-left: 18px; margin: 8px 0; font-size: .92rem; }
</style>
