<script setup>
import StatusBadge from "../common/StatusBadge.vue";
import { timeAgo } from "../../utils/date";
import { reportedToday } from "../../utils/spotStats";

defineProps({ spots: { type: Array, required: true } });
defineEmits(["log"]);
</script>

<template>
  <div class="card table-wrap">
    <table class="data-table">
      <thead><tr><th>Pantai</th><th>Status</th><th>Laporan hari ini</th><th>Laporan terakhir</th><th></th></tr></thead>
      <tbody>
        <tr v-for="s in spots" :key="s.id">
          <td><strong>{{ s.nama_pantai }}</strong><br /><span class="muted">{{ s.kabupaten }}</span></td>
          <td><StatusBadge :status="s.current_status" /></td>
          <td>
            <span class="flag" :class="reportedToday(s) ? 'done' : 'todo'">
              {{ reportedToday(s) ? "Sudah" : "Belum" }}
            </span>
          </td>
          <td class="muted">{{ s.kondisi_updated_at ? timeAgo(s.kondisi_updated_at) : "Belum ada" }}</td>
          <td class="row-actions"><button class="sm" @click="$emit('log', s.id)">Catat</button></td>
        </tr>
        <tr v-if="!spots.length"><td colspan="5" class="muted">Belum ada data pantai.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.row-actions { display: flex; justify-content: flex-end; }
.row-actions button { padding: 6px 12px; font-size: .82rem; }
.flag { padding: 3px 12px; border-radius: 999px; font-size: .78rem; font-weight: 700; }
.flag.done { background: #dff3e7; color: #17653c; }
.flag.todo { background: #fff1c9; color: #7a5600; }
</style>
