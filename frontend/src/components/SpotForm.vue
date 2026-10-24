<script setup>
import { reactive } from "vue";

const props = defineProps({ spot: Object });
const emit = defineEmits(["save", "cancel"]);

const form = reactive({
  nama_pantai: props.spot?.nama_pantai ?? "",
  kabupaten: props.spot?.kabupaten ?? "",
  kedalaman_avg: props.spot?.kedalaman_avg ?? "",
  is_ramah_anak: !!props.spot?.is_ramah_anak,
  ada_pelampung: !!props.spot?.ada_pelampung,
  current_status: props.spot?.current_status ?? "AMAN",
});
const submit = () => emit("save", { ...form, is_ramah_anak: form.is_ramah_anak ? 1 : 0, ada_pelampung: form.ada_pelampung ? 1 : 0 });
</script>

<template>
  <form class="card" @submit.prevent="submit">
    <h3>{{ spot ? "Ubah" : "Tambah" }} Data Pantai</h3>
    <label>Nama pantai <input v-model="form.nama_pantai" required /></label>
    <label>Kabupaten <input v-model="form.kabupaten" required /></label>
    <label>Kedalaman rata-rata (m) <input v-model="form.kedalaman_avg" type="number" step="0.1" min="0" /></label>
    <label>Status
      <select v-model="form.current_status"><option>AMAN</option><option>WASPADA</option><option>BAHAYA</option></select>
    </label>
    <label class="row"><input type="checkbox" v-model="form.is_ramah_anak" /> Ramah anak (landai)</label>
    <label class="row"><input type="checkbox" v-model="form.ada_pelampung" /> Ada pelampung</label>
    <div class="actions">
      <button type="button" class="ghost" @click="$emit('cancel')">Batal</button>
      <button type="submit">Simpan</button>
    </div>
  </form>
</template>

<style scoped>
.row { display: flex; gap: 8px; align-items: center; }
.row input { width: auto; }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
