<script setup>
import { computed } from "vue";
import StatusBadge from "../common/StatusBadge.vue";
import { summarizeSpots, recentReports } from "../../utils/spotStats";
import { timeAgo } from "../../utils/date";

const props = defineProps({ spots: { type: Array, required: true } });

const summary = computed(() => summarizeSpots(props.spots));
const recent = computed(() => recentReports(props.spots));
const cards = computed(() => [
  { cls: "", label: "Total pantai", value: summary.value.total },
  { cls: "aman", label: "Aman", value: summary.value.byStatus.AMAN },
  { cls: "waspada", label: "Waspada", value: summary.value.byStatus.WASPADA },
  { cls: "bahaya", label: "Bahaya / Tutup", value: summary.value.byStatus.BAHAYA },
  { cls: "belum", label: "Belum dilaporkan hari ini", value: summary.value.notReportedToday },
]);
</script>

<template>
  <div>
    <div class="stats">
      <div v-for="c in cards" :key="c.label" class="card stat" :class="c.cls">
        <span>{{ c.label }}</span><b>{{ c.value }}</b>
      </div>
    </div>

    <div class="actions">
      <a class="btn" href="/petugas/kondisi">📝 Catat Kondisi Harian</a>
      <a class="btn ghost" href="/petugas/pantai/tambah">+ Tambah Pantai</a>
      <a class="btn ghost" href="/petugas/pantai">Kelola Pantai</a>
    </div>

    <div class="card">
      <h2>Laporan terbaru</h2>
      <p v-if="!recent.length" class="muted">Belum ada laporan.</p>
      <ul v-else class="recent">
        <li v-for="s in recent" :key="s.id">
          <a :href="`/pantai/${s.id}`"><strong>{{ s.nama_pantai }}</strong></a>
          <StatusBadge :status="s.current_status" />
          <span class="muted">{{ timeAgo(s.kondisi_updated_at) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px; }
.stat { display: flex; flex-direction: column; gap: 4px; border-left: 5px solid var(--primary); }
.stat span { font-size: .8rem; color: #4b6772; }
.stat b { font-size: 1.8rem; font-family: var(--font-head); }
.stat.aman { border-left-color: var(--aman); }
.stat.waspada { border-left-color: var(--waspada); }
.stat.bahaya { border-left-color: var(--bahaya); }
.stat.belum { border-left-color: var(--amber); }

.actions { display: flex; gap: 8px; margin: 4px 0 16px; flex-wrap: wrap; align-items: center; }

h2 { font-size: 1.2rem; margin-bottom: 8px; }
.recent { list-style: none; margin: 8px 0 0; padding: 0; }
.recent li { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 9px 0; border-bottom: 1px solid var(--line); }
.recent li .muted { margin-left: auto; font-size: .84rem; }
</style>