<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import SpotCard from "./components/SpotCard.vue";
import FilterBar from "./components/FilterBar.vue";
import SpotDetail from "./components/SpotDetail.vue";
import AdminLogModal from "./components/AdminLogModal.vue";
import SpotForm from "./components/SpotForm.vue";
import StatusBadge from "./components/StatusBadge.vue";
import { getSpots, createSpot, updateSpot, deleteSpot } from "./services/api";

const view = ref("public");
const spots = ref([]);
const allSpots = ref([]); // tanpa filter, untuk daftar kabupaten & modal
const loading = ref(false);
const error = ref("");
const selectedId = ref(null);
const showLog = ref(false);
const editing = ref(null); // null | {} (baru) | spot

const filters = reactive({ kabupaten: "", status: "", ada_pelampung: false, ramah_anak: false });
const kabupatenList = computed(() => [...new Set(allSpots.value.map((s) => s.kabupaten))].sort());

async function load() {
  loading.value = true; error.value = "";
  try {
    const params = {};
    if (filters.kabupaten) params.kabupaten = filters.kabupaten;
    if (filters.status) params.status = filters.status;
    if (filters.ada_pelampung) params.ada_pelampung = 1;
    if (filters.ramah_anak) params.ramah_anak = 1;
    spots.value = (await getSpots(params)).data;
    allSpots.value = (await getSpots()).data;
  } catch {
    error.value = "Tidak dapat terhubung ke server API. Pastikan Back-End berjalan.";
  } finally { loading.value = false; }
}

async function saveSpot(payload) {
  try {
    editing.value?.id ? await updateSpot(editing.value.id, payload) : await createSpot(payload);
    editing.value = null; await load();
  } catch (e) { error.value = e.response?.data?.error || "Gagal menyimpan data."; }
}
async function removeSpot(s) {
  if (!confirm(`Hapus ${s.nama_pantai}? Seluruh riwayat lognya ikut terhapus.`)) return;
  try { await deleteSpot(s.id); await load(); } catch { error.value = "Gagal menghapus data."; }
}
async function onLogSaved() { showLog.value = false; await load(); }

watch(filters, load);
onMounted(load);
</script>

<template>
  <Navbar :view="view" @navigate="(v) => { view = v; selectedId = null; editing = null; }" />
  <main>
    <p v-if="error" class="error">{{ error }}</p>

    <!-- HALAMAN PUBLIK -->
    <template v-if="view === 'public'">
      <SpotDetail v-if="selectedId" :spot-id="selectedId" @close="selectedId = null" />
      <template v-else>
        <h1>Status Kelayakan Berenang Danau Toba</h1>
        <p class="muted">Informasi kondisi pesisir yang diperbarui petugas lapangan.</p>
        <FilterBar v-model="filters" :kabupaten-list="kabupatenList" />
        <p v-if="loading" class="muted">Memuat…</p>
        <p v-else-if="!spots.length && !error" class="muted">Tidak ada pantai yang cocok dengan filter.</p>
        <div class="grid">
          <SpotCard v-for="s in spots" :key="s.id" :spot="s" @select="selectedId = $event" />
        </div>
      </template>
    </template>

    <!-- HALAMAN PETUGAS -->
    <template v-else>
      <h1>Panel Petugas</h1>
      <div class="toolbar">
        <button @click="editing = {}">+ Tambah Pantai</button>
        <button class="ghost" :disabled="!allSpots.length" @click="showLog = true">📝 Catat Kondisi Harian</button>
      </div>
      <SpotForm v-if="editing" :key="editing.id || 'new'" :spot="editing.id ? editing : null"
                @save="saveSpot" @cancel="editing = null" />
      <div class="card" style="margin-top:16px">
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
    </template>
  </main>
  <AdminLogModal v-if="showLog" :spots="allSpots" @close="showLog = false" @saved="onLogSaved" />
  <Footer />
</template>

<style scoped>
.toolbar { display: flex; gap: 8px; margin: 12px 0 16px; flex-wrap: wrap; }
table { width: 100%; border-collapse: collapse; font-size: .92rem; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--line); }
.row-actions { display: flex; gap: 6px; justify-content: flex-end; }
</style>
