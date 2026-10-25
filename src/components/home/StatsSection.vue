<script setup>
import { computed } from "vue";

const props = defineProps({ summary: { type: Object, required: true } });

const cards = computed(() => [
  { value: props.summary.total, label: "Pantai dipantau", text: "Titik pesisir di sekitar Danau Toba yang datanya diperbarui petugas." },
  { value: props.summary.kabupaten, label: "Kabupaten tercakup", text: "Wilayah pesisir yang saat ini sudah memiliki data pantai." },
  { value: props.summary.byStatus.AMAN, label: "Pantai aman", text: "Berstatus hijau: air bersih dan ombak tenang." },
  { value: props.summary.needAttention, label: "Perlu kewaspadaan", text: "Berstatus kuning atau merah. Periksa detailnya sebelum berenang." },
]);
</script>

<template>
  <section class="home-block stats">
    <div v-for="c in cards" :key="c.label" class="stat">
      <strong>{{ c.value }}</strong>
      <h4>{{ c.label }}</h4>
      <p>{{ c.text }}</p>
    </div>
  </section>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; padding-top: 24px; }
.stat strong { display: block; font-size: 2.3rem; color: var(--accent); font-weight: 800; }
.stat h4 { font-size: .95rem; color: #fff; margin: 4px 0 8px; }
.stat p { margin: 0; font-size: .82rem; color: var(--muted); line-height: 1.6; }
@media (max-width: 900px) { .stats { grid-template-columns: 1fr 1fr; } }
</style>
