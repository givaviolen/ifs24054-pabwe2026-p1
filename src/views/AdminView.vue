<script setup>
import { ref, computed, watch } from "vue";
import SpotForm from "../components/spots/SpotForm.vue";
import AdminSummary from "../components/admin/AdminSummary.vue";
import AdminSpotTable from "../components/admin/AdminSpotTable.vue";
import AdminLogTable from "../components/admin/AdminLogTable.vue";
import AdminLogModal from "../components/admin/AdminLogModal.vue";
import { ADMIN_TABS } from "../constants/navigation";
import { auth } from "../composables/useAuth";
import { allSpots } from "../composables/useSpots";
import { go } from "../composables/useRoute";
import { useNotice } from "../composables/useNotice";
import { useSpotActions } from "../composables/useSpotActions";
import { useLogDialog } from "../composables/useLogDialog";
import { searchSpots } from "../utils/spotSearch";

// page: admin | admin-spots | admin-spot-new | admin-log
const props = defineProps({ page: { type: String, default: "admin" } });

const { notice, notify } = useNotice();
const actions = useSpotActions(notify);
const logDialog = useLogDialog(() => props.page);

const search = ref("");
const editing = ref(null);
const rows = computed(() => searchSpots(allSpots.value, search.value));
watch(() => props.page, () => { editing.value = null; });

async function saveNew(payload) {
  if (await actions.create(payload)) go("/petugas/pantai");
}
async function saveEdit(payload) {
  if (await actions.update(editing.value.id, payload)) editing.value = null;
}
function removeSpot(spot) {
  if (confirm(`Hapus ${spot.nama_pantai}? Seluruh riwayat lognya ikut terhapus.`)) actions.remove(spot);
}
function onLogSaved(info) {
  logDialog.afterSaved();
  notify("ok", `Laporan ${info?.spot || "pantai"} tersimpan. Status sekarang: ${info?.status || "-"}.`);
}
</script>

<template>
  <section>
    <h1>Panel Petugas</h1>
    <p class="muted">Masuk sebagai {{ auth.user?.nama }}. Perubahan langsung tampil bagi wisatawan.</p>

    <nav class="tabs" aria-label="Menu petugas">
      <a v-for="t in ADMIN_TABS" :key="t.name" :href="t.href" :class="{ on: page === t.name }">{{ t.label }}</a>
    </nav>

    <p v-if="notice" class="notice" :class="notice.type" role="status">{{ notice.text }}</p>

    <AdminSummary v-if="page === 'admin'" :spots="allSpots" />

    <template v-else-if="page === 'admin-spots'">
      <div class="toolbar">
        <a class="btn" href="/petugas/pantai/tambah">+ Tambah Pantai</a>
        <input v-model="search" type="search" class="find" placeholder="Cari pantai…" aria-label="Cari pantai" />
      </div>
      <SpotForm v-if="editing" :key="editing.id" :spot="editing" @save="saveEdit" @cancel="editing = null" />
      <AdminSpotTable :spots="rows" @edit="editing = $event" @remove="removeSpot" />
    </template>

    <SpotForm v-else-if="page === 'admin-spot-new'" @save="saveNew" @cancel="go('/petugas/pantai')" />

    <AdminLogTable v-else-if="page === 'admin-log'" :spots="rows" @log="logDialog.open" />

    <AdminLogModal v-if="logDialog.visible.value" :key="logDialog.spotId.value ?? 'x'" :spots="allSpots"
                   :spot-id="logDialog.spotId.value" @close="logDialog.close" @saved="onLogSaved" />
  </section>
</template>

<style scoped>
.tabs { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 18px; border-bottom: 1px solid var(--line); }
.tabs a { padding: 9px 16px; font-size: .9rem; color: var(--muted); text-decoration: none; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tabs a:hover { color: #fff; }
.tabs a.on { color: var(--accent); border-bottom-color: var(--accent); font-weight: 700; }

.notice { padding: 10px 14px; border-radius: 12px; font-size: .92rem; margin: 8px 0 14px; }
.notice.ok { background: #dff3e7; color: #17653c; }
.notice.err { background: #fbd9d9; color: #8c2b2b; }

.toolbar { display: flex; gap: 8px; margin: 4px 0 16px; flex-wrap: wrap; align-items: center; }
.find { flex: 1 1 200px; max-width: 280px; margin-left: auto; border-radius: 999px; }
</style>
