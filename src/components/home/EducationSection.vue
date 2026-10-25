<script setup>
import { EDUCATION_ITEMS } from "../../data/education";

defineEmits(["open"]);
</script>

<template>
  <section class="home-block edu">
    <article v-for="e in EDUCATION_ITEMS" :key="e.title" class="col">
      <span class="tag">{{ e.tag }}</span>
      <h3>{{ e.title }}</h3>
      <p>{{ e.text }}</p>
      <button type="button" class="home-pill home-pill--lime" @click="$emit('open', e.patch, e.path)">{{ e.action }}</button>
    </article>
  </section>
</template>

<style scoped>
.edu { display: grid; grid-template-columns: repeat(4, 1fr); padding-top: 24px; }
.col { padding: 8px 24px; border-left: 1px solid var(--line); display: flex; flex-direction: column; }
.col:first-child { border-left: 0; padding-left: 0; }
.tag { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
.col h3 { color: var(--accent); font-size: 1.02rem; }
.col p { color: var(--muted); font-size: .84rem; line-height: 1.7; flex: 1; margin: 6px 0 18px; }
.col .home-pill { align-self: flex-start; }
@media (max-width: 900px) {
  .edu { grid-template-columns: 1fr 1fr; row-gap: 28px; }
  .col:nth-child(3) { border-left: 0; padding-left: 0; }
}
@media (max-width: 560px) {
  .edu { grid-template-columns: 1fr; }
  .col { border-left: 0; padding-left: 0; }
}
</style>
