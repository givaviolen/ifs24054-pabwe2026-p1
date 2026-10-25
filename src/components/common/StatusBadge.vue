<script setup>
import { computed } from "vue";
import { statusMeta } from "../../constants/status";

const props = defineProps({ status: String });
const info = computed(() => statusMeta(props.status));
</script>

<template>
  <span class="badge" :style="{ background: info.cssVar }">{{ info.icon }} {{ info.label }}</span>
</template>

<style scoped>
.badge { display: inline-block; color: #fff; padding: 3px 10px; border-radius: 999px; font-size: .8rem; font-weight: 600; }
</style>
