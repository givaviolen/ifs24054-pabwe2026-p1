<script setup>
import { reactive, ref, computed } from "vue";
import { addCondition, describeError } from "../services/api";
import { deriveStatus, STATUS_INFO } from "../utils/format";

const props = defineProps({ spots: Array, spotId: { type: Number, default: null } });
const emit = defineEmits(["close", "saved"]);

const form = reactive({
  spot_id: props.spotId ?? props.spots[0]?.id ?? "",
  kondisi_eceng_gondok: "Bersih",
  tinggi_ombak: "Tenang",
  current_status: "",
  catatan_petugas: "",
});
const error = ref("");
const saving = ref(false);

// Pratinjau status yang akan dipakai bila petugas tidak memilih status manual.
const autoStatus = computed(() => deriveStatus(form.kondisi_eceng_gondok, form.tinggi_ombak));
const finalStatus = computed(() => form.current_status || autoStatus.value);
const spotName = computed(() => props.spots.find((s) => s.id === Number(form.spot_id))?.nama_pantai || "");

async function submit() {
  error.value = ""; saving.value = true;
  try {
    const res = await addCondition({ ...form, spot_id: Number(form.spot_id), current_status: form.current_status || undefined });
    emit("saved", { spot: spotName.value, status: res.current_status });
  } catch (e) {
    error.value = describeError(e, "Gagal menyimpan laporan.").message;
  } finally { saving.value = false; }
}
</script>

<template>
  <div class="overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')">
    <form class="card modal" @submit.prevent="submit">
      <h3>Laporan Kondisi Harian</h3>
      <label>Pantai
        <select v-model="form.spot_id" required>
          <option v-for="s in spots" :key="s.id" :value="s.id">{{ s.nama_pantai }}</option>
        </select>
      </label>
      <div class="pair">
        <label>Eceng gondok
          <select v-model="form.kondisi_eceng_gondok"><option>Bersih</option><option>Sedang</option><option>Pekat</option></select>
        </label>
        <label>Tinggi ombak
          <select v-model="form.tinggi_ombak"><option>Tenang</option><option>Sedang</option><option>Tinggi</option></select>
        </label>
      </div>
      <label>Status pantai
        <select v-model="form.current_status">
          <option value="">Otomatis dari kondisi ({{ autoStatus }})</option>
          <option value="AMAN">AMAN</option><option value="WASPADA">WASPADA</option><option value="BAHAYA">BAHAYA (tutup darurat)</option>
        </select>
      </label>
      <p class="preview" :class="finalStatus.toLowerCase()">
        Status setelah disimpan: <strong>{{ STATUS_INFO[finalStatus].icon }} {{ STATUS_INFO[finalStatus].label }}</strong>
      </p>
      <label>Catatan petugas
        <textarea v-model="form.catatan_petugas" rows="3" maxlength="300" placeholder="Contoh: angin kencang dari barat, berenang dibatasi hingga 15.00"></textarea>
      </label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="actions">
        <button type="button" class="ghost" @click="$emit('close')">Batal</button>
        <button type="submit" :disabled="saving">{{ saving ? "Menyimpan…" : "Simpan laporan" }}</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); backdrop-filter: blur(3px); display: grid; place-items: center; padding: 16px; z-index: 1500; }
.modal { width: 100%; max-width: 460px; max-height: 90vh; overflow: auto; }
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.preview { margin: 0 0 12px; padding: 8px 12px; border-radius: 10px; font-size: .88rem; background: #dff3e7; color: #17653c; }
.preview.waspada { background: #fff1c9; color: #7a5600; }
.preview.bahaya { background: #fbd9d9; color: #8c2b2b; }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
