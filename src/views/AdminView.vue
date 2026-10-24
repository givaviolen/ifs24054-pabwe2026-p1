<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import LoginPanel from "../components/LoginPanel.vue";
import SpotForm from "../components/SpotForm.vue";
import AdminLogModal from "../components/AdminLogModal.vue";
import StatusBadge from "../components/StatusBadge.vue";
import { auth } from "../composables/useAuth";
import { allSpots, loadSpots } from "../composables/useSpots";
import { createSpot, updateSpot, deleteSpot, describeError } from "../services/api";
import { timeAgo } from "../utils/format";

const notice = ref(null); // { type: "ok" | "err", text }
const showLog = ref(false);
const logSpotId = ref(null);
const editing = ref(null); // null | {} (baru) | spot
const search = ref("");
let noticeTimer;

function toast(type, text) {
  notice.value = { type, text };
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice.value = null; }, 5000);
}
onBeforeUnmount(() => clearTimeout(noticeTimer));

const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  const list = [...allSpots.value].sort((a, b) => a.nama_pantai.localeCompare(b.nama_pantai));
  return q ? list.filter((s) => `${s.nama_pantai} ${s.kabupaten}`.toLowerCase().includes(q)) : list;
});

async function saveSpot(payload) {
  const isEdit = Boolean(editing.value?.id);
  try {
    isEdit ? await updateSpot(editing.value.id, payload) : await createSpot(payload);
    editing.value = null;
    await loadSpots();
    toast("ok", isEdit ? "Data pantai berhasil diperbarui." : "Pantai baru berhasil ditambahkan.");
  } catch (e) { toast("err", describeError(e, "Gagal menyimpan data.").message); }
}

async function removeSpot(s) {
  if (!confirm(`Hapus ${s.nama_pantai}? Seluruh riwayat lognya ikut terhapus.`)) return;
  try {
    await deleteSpot(s.id);
    await loadSpots();
    toast("ok", `${s.nama_pantai} dihapus.`);
  } catch (e) { toast("err", describeError(e, "Gagal menghapus data.").message); }
}

function openLog(spotId = null) { logSpotId.value = spotId; showLog.value = true; }
async function onLogSaved(info) {
  showLog.value = false;
  await loadSpots();
  toast("ok", `Laporan ${info?.spot || "pantai"} tersimpan. Status sekarang: ${info?.status || "-"}.`);
}
</script>

<template>
  <p v-if="!auth.ready" class="muted">Memeriksa sesi…</p>
  <LoginPanel v-else-if="!auth.user" />
  <section v-else>
    <h1>Panel Petugas</h1>
    <p class="muted">Masuk sebagai {{ auth.user.nama }}. Perubahan langsung tampil bagi wisatawan.</p>

    <p v-if="notice" class="notice" :class="notice.type" role="status">{{ notice.text }}</p>

    <div class="toolbar">
      <button @click="editing = {}">+ Tambah Pantai</button>
      <button class="ghost" :disabled="!allSpots.length" @click="openLog()">📝 Catat Kondisi Harian</button>
      <input v-model="search" type="search" class="find" placeholder="Cari pantai…" aria-label="Cari pantai" />
    </div>

    <SpotForm v-if="editing" :key="editing.id || 'new'" :spot="editing.id ? editing : null"
              @save="saveSpot" @cancel="editing = null" />

    <div class="card tablewrap" style="margin-top:16px">
      <table>
        <thead><tr><th>Pantai</th><th>Kabupaten</th><th>Status</th><th>Laporan terakhir</th><th></th></tr></thead>
        <tbody>
          <tr v-for="s in rows" :key="s.id">
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
              <button class="ghost" @click="openLog(s.id)">Catat</button>
              <button class="ghost" @click="editing = s">Ubah</button>
              <button class="danger" @click="removeSpot(s)">Hapus</button>
            </td>
          </tr>
          <tr v-if="!rows.length"><td colspan="5" class="muted">Tidak ada pantai yang cocok.</td></tr>
        </tbody>
      </table>
    </div>

    <AdminLogModal v-if="showLog" :spots="allSpots" :spot-id="logSpotId" @close="showLog = false" @saved="onLogSaved" />
  </section>
</template>

<style scoped>
.toolbar { display: flex; gap: 8px; margin: 12px 0 16px; flex-wrap: wrap; align-items: center; }
.find { flex: 1 1 200px; max-width: 280px; margin-left: auto; border-radius: 999px; }
.notice { padding: 10px 14px; border-radius: 12px; font-size: .92rem; margin: 8px 0; }
.notice.ok { background: #dff3e7; color: #17653c; }
.notice.err { background: #fbd9d9; color: #8c2b2b; }
.tablewrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: .92rem; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: middle; }
.row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
.row-actions button { padding: 6px 12px; font-size: .82rem; }
</style>
