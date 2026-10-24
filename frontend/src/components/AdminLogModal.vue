<script setup>
import { reactive, ref } from "vue";
import { addCondition } from "../services/api";

const props = defineProps({ spots: Array });
const emit = defineEmits(["close", "saved"]);

const form = reactive({
  spot_id: props.spots[0]?.id ?? "",
  kondisi_eceng_gondok: "Bersih",
  tinggi_ombak: "Tenang",
  current_status: "",
  catatan_petugas: "",
});
const error = ref("");
const saving = ref(false);

async function submit() {
  error.value = ""; saving.value = true;
  try {
    await addCondition({ ...form, spot_id: Number(form.spot_id), current_status: form.current_status || undefined });
    emit("saved");
  } catch (e) {
    error.value = e.response?.data?.error || "Gagal menyimpan laporan.";
  } finally { saving.value = false; }
}
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <form class="card modal" @submit.prevent="submit">
      <h3>Laporan Kondisi Harian</h3>
      <label>Pantai
        <select v-model="form.spot_id" required>
          <option v-for="s in spots" :key="s.id" :value="s.id">{{ s.nama_pantai }}</option>
        </select>
      </label>
      <label>Eceng gondok
        <select v-model="form.kondisi_eceng_gondok"><option>Bersih</option><option>Sedang</option><option>Pekat</option></select>
      </label>
      <label>Tinggi ombak
        <select v-model="form.tinggi_ombak"><option>Tenang</option><option>Sedang</option><option>Tinggi</option></select>
      </label>
      <label>Status pantai
        <select v-model="form.current_status">
          <option value="">Otomatis dari kondisi</option>
          <option value="AMAN">AMAN</option><option value="WASPADA">WASPADA</option><option value="BAHAYA">BAHAYA (tutup)</option>
        </select>
      </label>
      <label>Catatan petugas
        <textarea v-model="form.catatan_petugas" rows="3" placeholder="Contoh: angin kencang dari barat, berenang dibatasi hingga 15.00"></textarea>
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="actions">
        <button type="button" class="ghost" @click="$emit('close')">Batal</button>
        <button type="submit" :disabled="saving">{{ saving ? "Menyimpan…" : "Simpan" }}</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: grid; place-items: center; padding: 16px; z-index: 10; }
.modal { width: 100%; max-width: 440px; max-height: 90vh; overflow: auto; }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
