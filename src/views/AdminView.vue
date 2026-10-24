<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import SpotForm from "../components/SpotForm.vue";
import AdminLogModal from "../components/AdminLogModal.vue";
import StatusBadge from "../components/StatusBadge.vue";
import { auth } from "../composables/useAuth";
import { allSpots, loadSpots } from "../composables/useSpots";
import { route, go } from "../composables/useRoute";
import { createSpot, updateSpot, deleteSpot, describeError } from "../services/api";
import { timeAgo, parseSqlDate } from "../utils/format";

// page: admin | admin-spots | admin-spot-new | admin-log
const props = defineProps({ page: { type: String, default: "admin" } });

const tabs = [
  { name: "admin", href: "/petugas", label: "Ringkasan" },
  { name: "admin-spots", href: "/petugas/pantai", label: "Kelola Pantai" },
  { name: "admin-spot-new", href: "/petugas/pantai/tambah", label: "Tambah Pantai" },
  { name: "admin-log", href: "/petugas/kondisi", label: "Catat Kondisi" },
];

// ---------- notifikasi ----------
const notice = ref(null); // { type: "ok" | "err", text }
let noticeTimer;
function toast(type, text) {
  notice.value = { type, text };
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice.value = null; }, 5000);
}
onBeforeUnmount(() => clearTimeout(noticeTimer));

// ---------- ringkasan ----------
const wibDay = (d) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
const reportedToday = (s) => {
  const d = parseSqlDate(s.kondisi_updated_at);
  return !!d && wibDay(d) === wibDay(new Date());
};
const stats = computed(() => {
  const list = allSpots.value;
  const n = (st) => list.filter((s) => s.current_status === st).length;
  return { total: list.length, AMAN: n("AMAN"), WASPADA: n("WASPADA"), BAHAYA: n("BAHAYA"),
           belum: list.filter((s) => !reportedToday(s)).length };
});
const recent = computed(() =>
  allSpots.value
    .filter((s) => s.kondisi_updated_at)
    .sort((a, b) => parseSqlDate(b.kondisi_updated_at) - parseSqlDate(a.kondisi_updated_at))
    .slice(0, 5)
);

// ---------- kelola pantai ----------
const search = ref("");
const editing = ref(null);
const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  const list = [...allSpots.value].sort((a, b) => a.nama_pantai.localeCompare(b.nama_pantai));
  return q ? list.filter((s) => `${s.nama_pantai} ${s.kabupaten}`.toLowerCase().includes(q)) : list;
});
watch(() => props.page, () => { editing.value = null; });

async function saveNew(payload) {
  try {
    await createSpot(payload);
    await loadSpots();
    toast("ok", "Pantai baru berhasil ditambahkan.");
    go("/petugas/pantai");
  } catch (e) { toast("err", describeError(e, "Gagal menyimpan data.").message); }
}

async function saveEdit(payload) {
  try {
    await updateSpot(editing.value.id, payload);
    editing.value = null;
    await loadSpots();
    toast("ok", "Data pantai berhasil diperbarui.");
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

// ---------- catat kondisi harian ----------
const showLog = ref(false);
const logSpotId = ref(null);
function openLog(id = null) { logSpotId.value = id; showLog.value = true; }
function closeLog() {
  showLog.value = false;
  if (route.query.spot) go("/petugas/kondisi", { replace: true });
}
async function onLogSaved(info) {
  showLog.value = false;
  if (route.query.spot) go("/petugas/kondisi", { replace: true });
  await loadSpots();
  toast("ok", `Laporan ${info?.spot || "pantai"} tersimpan. Status sekarang: ${info?.status || "-"}.`);
}
// Alamat /petugas/kondisi?spot=5 langsung membuka formulir untuk pantai tersebut.
watch(
  () => [props.page, route.query.spot, allSpots.value.length],
  () => {
    if (props.page === "admin-log" && route.query.spot && allSpots.value.length && !showLog.value) {
      openLog(Number(route.query.spot));
    }
  },
  { immediate: true }
);
</script>

<template>
  <section>
    <h1>Panel Petugas</h1>
    <p class="muted">Masuk sebagai {{ auth.user?.nama }}. Perubahan langsung tampil bagi wisatawan.</p>

    <nav class="tabs" aria-label="Menu petugas">
      <a v-for="t in tabs" :key="t.name" :href="t.href" :class="{ on: page === t.name }">{{ t.label }}</a>
    </nav>

    <p v-if="notice" class="notice" :class="notice.type" role="status">{{ notice.text }}</p>

    <!-- /petugas : ringkasan -->
    <template v-if="page === 'admin'">
      <div class="stats">
        <div class="card stat"><span>Total pantai</span><b>{{ stats.total }}</b></div>
        <div class="card stat aman"><span>Aman</span><b>{{ stats.AMAN }}</b></div>
        <div class="card stat waspada"><span>Waspada</span><b>{{ stats.WASPADA }}</b></div>
        <div class="card stat bahaya"><span>Bahaya / Tutup</span><b>{{ stats.BAHAYA }}</b></div>
        <div class="card stat belum"><span>Belum dilaporkan hari ini</span><b>{{ stats.belum }}</b></div>
      </div>

      <div class="actions">
        <a class="btn" href="/petugas/kondisi">📝 Catat Kondisi Harian</a>
        <a class="btn ghost" href="/petugas/pantai/tambah">+ Tambah Pantai</a>
        <a class="btn ghost" href="/petugas/pantai">Kelola Pantai</a>
      </div>

      <div class="card">
        <h3>Laporan terbaru</h3>
        <p v-if="!recent.length" class="muted">Belum ada laporan.</p>
        <ul v-else class="recent">
          <li v-for="s in recent" :key="s.id">
            <a :href="`/pantai/${s.id}`"><strong>{{ s.nama_pantai }}</strong></a>
            <StatusBadge :status="s.current_status" />
            <span class="muted">{{ timeAgo(s.kondisi_updated_at) }}</span>
          </li>
        </ul>
      </div>
    </template>

    <!-- /petugas/pantai : kelola pantai -->
    <template v-else-if="page === 'admin-spots'">
      <div class="toolbar">
        <a class="btn" href="/petugas/pantai/tambah">+ Tambah Pantai</a>
        <input v-model="search" type="search" class="find" placeholder="Cari pantai…" aria-label="Cari pantai" />
      </div>

      <SpotForm v-if="editing" :key="editing.id" :spot="editing" @save="saveEdit" @cancel="editing = null" />

      <div class="card tablewrap">
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
                <a class="btn ghost sm" :href="`/petugas/kondisi?spot=${s.id}`">Catat</a>
                <button class="ghost" @click="editing = s">Ubah</button>
                <button class="danger" @click="removeSpot(s)">Hapus</button>
              </td>
            </tr>
            <tr v-if="!rows.length"><td colspan="5" class="muted">Tidak ada pantai yang cocok.</td></tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- /petugas/pantai/tambah -->
    <template v-else-if="page === 'admin-spot-new'">
      <SpotForm @save="saveNew" @cancel="go('/petugas/pantai')" />
    </template>

    <!-- /petugas/kondisi : catat kondisi harian -->
    <template v-else-if="page === 'admin-log'">
      <div class="card tablewrap">
        <table>
          <thead><tr><th>Pantai</th><th>Status</th><th>Laporan hari ini</th><th>Laporan terakhir</th><th></th></tr></thead>
          <tbody>
            <tr v-for="s in rows" :key="s.id">
              <td><strong>{{ s.nama_pantai }}</strong><br /><span class="muted">{{ s.kabupaten }}</span></td>
              <td><StatusBadge :status="s.current_status" /></td>
              <td>
                <span class="flag" :class="reportedToday(s) ? 'done' : 'todo'">
                  {{ reportedToday(s) ? "Sudah" : "Belum" }}
                </span>
              </td>
              <td class="muted">{{ s.kondisi_updated_at ? timeAgo(s.kondisi_updated_at) : "Belum ada" }}</td>
              <td class="row-actions"><button @click="openLog(s.id)">Catat</button></td>
            </tr>
            <tr v-if="!rows.length"><td colspan="5" class="muted">Belum ada data pantai.</td></tr>
          </tbody>
        </table>
      </div>
    </template>

    <AdminLogModal v-if="showLog" :key="logSpotId ?? 'x'" :spots="allSpots" :spot-id="logSpotId"
                   @close="closeLog" @saved="onLogSaved" />
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

.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px; }
.stat { display: flex; flex-direction: column; gap: 4px; border-left: 5px solid var(--primary); }
.stat span { font-size: .8rem; color: #4b6772; }
.stat b { font-size: 1.8rem; font-family: var(--font-head); }
.stat.aman { border-left-color: var(--aman); }
.stat.waspada { border-left-color: var(--waspada); }
.stat.bahaya { border-left-color: var(--bahaya); }
.stat.belum { border-left-color: var(--amber); }

.actions, .toolbar { display: flex; gap: 8px; margin: 4px 0 16px; flex-wrap: wrap; align-items: center; }
.btn { display: inline-block; padding: 9px 18px; border-radius: 999px; font-size: .88rem; font-weight: 600;
  background: var(--primary); color: #fff; text-decoration: none; border: 1px solid var(--primary); }
.btn:hover { filter: brightness(1.12); }
.btn.ghost { background: transparent; color: var(--ghost); border-color: var(--ghost); }
.btn.sm { padding: 6px 12px; font-size: .82rem; }
.find { flex: 1 1 200px; max-width: 280px; margin-left: auto; border-radius: 999px; }

.recent { list-style: none; margin: 8px 0 0; padding: 0; }
.recent li { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 9px 0; border-bottom: 1px solid var(--line); }
.recent li .muted { margin-left: auto; font-size: .84rem; }

.tablewrap { overflow-x: auto; margin-top: 12px; }
table { width: 100%; border-collapse: collapse; font-size: .92rem; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: middle; }
.row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; align-items: center; }
.row-actions button { padding: 6px 12px; font-size: .82rem; }

.flag { padding: 3px 12px; border-radius: 999px; font-size: .78rem; font-weight: 700; }
.flag.done { background: #dff3e7; color: #17653c; }
.flag.todo { background: #fff1c9; color: #7a5600; }
</style>