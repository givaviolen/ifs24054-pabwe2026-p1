<script setup>
defineProps({ view: String });
defineEmits(["navigate"]);
</script>

<template>
  <header class="nav">
    <strong class="brand">🌊 TobaWaterSafe</strong>
    <nav>
      <button :class="view === 'public' ? '' : 'ghost'" @click="$emit('navigate', 'public')">Pantai</button>
      <button :class="view === 'admin' ? '' : 'ghost'" @click="$emit('navigate', 'admin')">Petugas</button>
    </nav>
  </header>
</template>

<style scoped>
.nav { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 5; }
.brand { color: var(--primary); }
nav { display: flex; gap: 8px; }
</style>
