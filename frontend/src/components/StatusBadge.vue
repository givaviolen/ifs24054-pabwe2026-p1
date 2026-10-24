<script setup>
import { computed } from "vue";
const props = defineProps({ status: String });
const map = {
  AMAN: { label: "Aman Berenang", icon: "🟢", color: "var(--aman)" },
  WASPADA: { label: "Waspada", icon: "🟡", color: "var(--waspada)" },
  BAHAYA: { label: "Bahaya / Tutup", icon: "🔴", color: "var(--bahaya)" },
};
const info = computed(() => map[props.status] || map.AMAN);
</script>

<template>
  <span class="badge" :style="{ background: info.color }">{{ info.icon }} {{ info.label }}</span>
</template>

<style scoped>
.badge { display: inline-block; color: #fff; padding: 3px 10px; border-radius: 999px; font-size: .8rem; font-weight: 600; }
</style>
