<script setup>
import { ref } from "vue";
import LoginPanel from "../components/LoginPanel.vue";
import SpotForm from "../components/SpotForm.vue";
import AdminLogModal from "../components/AdminLogModal.vue";
import StatusBadge from "../components/StatusBadge.vue";
import { auth } from "../composables/useAuth";
import { allSpots, loadSpots } from "../composables/useSpots";
import { createSpot, updateSpot, deleteSpot } from "../services/api";

const message = ref("");
const showLog = ref(false);
const editing = ref(null); // null | {} (baru) | spot

async function saveSpot(payload) {
  message.value = "";
  try {
    editing.value?.id ? await updateSpot(editing.value.id, payload) : await createSpot(payload);
    editing.value = null;
    await loadSpots();
  } catch (e) { message.value = e.response?.data?.error || "Gagal menyimpan data."; }
}

async function removeSpot(s) {
  if (!confirm(`Hapus ${s.nama_pantai}? Seluruh riwayat lognya ikut terhapus.`)) return;
  message.value = "";
  try { await deleteSpot(s.id); await loadSpots(); }
  catch (e) { message.value = e.response?.data?.error || "Gagal menghapus data."; }
}

async function onLogSaved() { showLog.value = false; await loadSpots(); }
</script>

<template>
  <p v-if="!auth.ready" class="muted">Memeriksa sesi…</p>
  <LoginPanel v-else-if="!auth.user" />
  <section v-else>
    <h1>Panel Petugas</h1>
    <p class="muted">Masuk sebagai {{ auth.user.nama }}.</p>
    <p v-if="message" class="error">{{ message }}</p>

    <div class="toolbar">
      <button @click="editing = {}">+ Tambah Pantai</button>
      <button class="ghost" :disabled="!allSpots.length" @click="showLog = true">📝 Catat Kondisi Harian</button>
    </div>

    <SpotForm v-if="editing" :key="editing.id || 'new'" :spot="editing.id ? editing : null"
              @save="saveSpot" @cancel="editing = null" />

    <div class="card tablewrap" style="margin-top:16px">
      <table>
        <thead><tr><th>Pantai</th><th>Kabupaten</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="s in allSpots" :key="s.id">
            <td>{{ s.nama_pantai }}</td><td>{{ s.kabupaten }}</td>
            <td><StatusBadge :status="s.current_status" /></td>
            <td class="row-actions">
              <button class="ghost" @click="editing = s">Ubah</button>
              <button class="danger" @click="removeSpot(s)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminLogModal v-if="showLog" :spots="allSpots" @close="showLog = false" @saved="onLogSaved" />
  </section>
</template>

<style scoped>
.toolbar { display: flex; gap: 8px; margin: 12px 0 16px; flex-wrap: wrap; }
.tablewrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: .92rem; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--line); }
.row-actions { display: flex; gap: 6px; justify-content: flex-end; }
</style>
