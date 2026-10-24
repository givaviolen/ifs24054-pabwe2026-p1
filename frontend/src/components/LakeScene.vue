<script>
let counter = 0; // agar id gradien unik pada tiap instance
</script>

<script setup>
import { computed } from "vue";

// Ilustrasi danau & perbukitan (original) yang tampil bila foto belum disediakan.
const props = defineProps({ tone: { type: String, default: "dusk" } }); // dusk | dawn | day
const uid = `lw${++counter}`;

const PALETTE = {
  dusk: { sky: ["#0b3d5c", "#2a7fa8", "#f6c58b"], sun: "#ffe3a8", w1: "#1b7f9f", w2: "#062f47" },
  dawn: { sky: ["#16405f", "#4fa6b8", "#ffd7a1"], sun: "#fff1c9", w1: "#2c8fa8", w2: "#0a3b55" },
  day: { sky: ["#2a7fa8", "#7cc3de", "#dff3f8"], sun: "#fff7d6", w1: "#2a93b4", w2: "#0d4a66" },
};
const p = computed(() => PALETTE[props.tone] || PALETTE.dusk);
</script>

<template>
  <svg class="scene" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient :id="`${uid}-sky`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="p.sky[0]" />
        <stop offset=".55" :stop-color="p.sky[1]" />
        <stop offset="1" :stop-color="p.sky[2]" />
      </linearGradient>
      <linearGradient :id="`${uid}-water`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="p.w1" />
        <stop offset="1" :stop-color="p.w2" />
      </linearGradient>
    </defs>
    <rect width="1200" height="520" :fill="`url(#${uid}-sky)`" />
    <circle cx="880" cy="300" r="64" :fill="p.sun" opacity=".95" />
    <path d="M0 340 L110 250 L230 315 L340 215 L470 325 L570 270 L720 345 L0 345Z" fill="#14506f" opacity=".8" />
    <path d="M480 345 L640 255 L770 335 L910 235 L1050 325 L1200 265 L1200 355 L480 355Z" fill="#0f4560" opacity=".85" />
    <path d="M0 355 L200 305 L420 350 L650 312 L880 352 L1200 318 L1200 370 L0 370Z" fill="#0a3550" />
    <rect y="350" width="1200" height="170" :fill="`url(#${uid}-water)`" />
    <rect x="835" y="360" width="90" height="5" rx="2.5" :fill="p.sun" opacity=".55" />
    <rect x="850" y="376" width="60" height="4" rx="2" :fill="p.sun" opacity=".4" />
    <rect x="862" y="390" width="36" height="3" rx="1.5" :fill="p.sun" opacity=".3" />
    <path d="M0 410 Q75 398 150 410 T300 410 T450 410 T600 410 T750 410 T900 410 T1050 410 T1200 410" stroke="#fff" stroke-opacity=".22" fill="none" stroke-width="2" />
    <path d="M0 450 Q75 438 150 450 T300 450 T450 450 T600 450 T750 450 T900 450 T1050 450 T1200 450" stroke="#fff" stroke-opacity=".16" fill="none" stroke-width="2" />
    <path d="M0 490 Q75 478 150 490 T300 490 T450 490 T600 490 T750 490 T900 490 T1050 490 T1200 490" stroke="#fff" stroke-opacity=".12" fill="none" stroke-width="2" />
  </svg>
</template>

<style scoped>
.scene { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
</style>