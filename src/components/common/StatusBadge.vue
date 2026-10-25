<script setup>
import { computed } from "vue";
import { statusMeta } from "../../constants/status";

const props = defineProps({ status: String });
const info = computed(() => statusMeta(props.status));
const isWaspada = computed(() => (props.status || "").toUpperCase() === "WASPADA");
</script>

<template>
  <span
    class="badge"
    :class="{ 'badge-waspada': isWaspada }"
    :style="{ background: info.cssVar }"
  >
    {{ info.icon }} {{ info.label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  color: #ffffff;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.4;
}
.badge-waspada {
  color: #3b2502 !important;
}
</style>