<script setup>
import StatusBadge from "../common/StatusBadge.vue";
import { timeAgo } from "../../utils/date";

defineProps({ spots: { type: Array, required: true } });
defineEmits(["edit", "remove"]);
</script>

<template>
  <div class="card table-wrap">
    <table class="data-table">
      <thead><tr><th>Pantai</th><th>Kabupaten</th><th>Status</th><th>Laporan terakhir</th><th></th></tr></thead>
      <tbody>
        <tr v-for="s in spots" :key="s.id">
          <td><strong>{{ s.nama_pantai }}</strong></td>
          <td>{{ s.kabupaten }}</td>
          <td><StatusBadge :status="s.current_status" /></td>
          <td class="muted">
            <template v-if="s.kondisi_updated_at">
              🌿 {{ s.kondisi_eceng_gondok }} · 〰️ {{ s.tinggi_ombak }}<br />{{ timeAgo(s.kondisi_updated_at) }}
            </template>
            <template v-else>Belum ada</template>
          </td>
          <td class="row-actions">
            <a class="btn ghost sm" :href="`/petugas/kondisi?spot=${s.id}`">Catat</a>
            <button class="ghost" @click="$emit('edit', s)">Ubah</button>
            <button class="danger" @click="$emit('remove', s)">Hapus</button>
          </td>
        </tr>
        <tr v-if="!spots.length"><td colspan="5" class="muted">Tidak ada pantai yang cocok.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; align-items: center; }
.row-actions button { padding: 6px 12px; font-size: .82rem; }
</style>
