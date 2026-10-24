<script setup>
const props = defineProps({ modelValue: Object, kabupatenList: Array });
const emit = defineEmits(["update:modelValue"]);
const set = (key, value) => emit("update:modelValue", { ...props.modelValue, [key]: value });
</script>

<template>
  <div class="bar card">
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
    <label class="check">
      <input type="checkbox" :checked="modelValue.ada_pelampung" @change="set('ada_pelampung', $event.target.checked)" />
      Ada pelampung
    </label>
    <label class="check">
      <input type="checkbox" :checked="modelValue.ramah_anak" @change="set('ramah_anak', $event.target.checked)" />
      Ramah anak
    </label>
  </div>
</template>

<style scoped>
.bar { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; margin-bottom: 16px; }
.bar label { margin: 0; flex: 1 1 180px; }
.check { display: flex; align-items: center; gap: 8px; flex: 0 0 auto !important; }
.check input { width: auto; }
</style>
