<script setup>
const props = defineProps({ modelValue: Object, kabupatenList: Array, sort: String });
const emit = defineEmits(["update:modelValue", "update:sort"]);
const set = (key, value) => emit("update:modelValue", { ...props.modelValue, [key]: value });
</script>

<template>
  <div class="bar card">
    <label class="wide">Cari pantai
      <input type="search" :value="modelValue.q" placeholder="Nama pantai atau kabupaten…"
             @input="set('q', $event.target.value)" />
    </label>
    <label>Kabupaten
      <select :value="modelValue.kabupaten" @change="set('kabupaten', $event.target.value)">
        <option value="">Semua</option>
        <option v-for="k in kabupatenList" :key="k" :value="k">{{ k }}</option>
      </select>
    </label>
    <label>Status kelayakan
      <select :value="modelValue.status" @change="set('status', $event.target.value)">
        <option value="">Semua</option>
        <option value="AMAN">🟢 Aman Berenang</option>
        <option value="WASPADA">🟡 Waspada</option>
        <option value="BAHAYA">🔴 Bahaya / Tutup</option>
      </select>
    </label>
    <label v-if="sort !== undefined">Urutkan
      <select :value="sort" @change="emit('update:sort', $event.target.value)">
        <option value="nama">Nama (A–Z)</option>
        <option value="aman">Paling aman dulu</option>
        <option value="dangkal">Paling dangkal</option>
        <option value="terbaru">Laporan terbaru</option>
      </select>
    </label>
    <label class="check">
      <input type="checkbox" :checked="modelValue.ada_pelampung" @change="set('ada_pelampung', $event.target.checked)" />
      🛟 Ada pelampung
    </label>
    <label class="check">
      <input type="checkbox" :checked="modelValue.ramah_anak" @change="set('ramah_anak', $event.target.checked)" />
      👶 Ramah anak
    </label>
  </div>
</template>

<style scoped>
.bar { display: flex; flex-wrap: wrap; gap: 14px 16px; align-items: flex-end; margin-bottom: 16px; }
.bar label { margin: 0; flex: 1 1 160px; font-weight: 600; font-size: .82rem; }
.bar label.wide { flex: 2 1 260px; }
.bar input, .bar select { margin-top: 5px; font-weight: 400; }
.check { display: flex; align-items: center; gap: 8px; flex: 0 0 auto !important; padding-bottom: 9px; cursor: pointer; }
.check input { width: auto; margin: 0; }
</style>
