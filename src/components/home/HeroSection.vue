<script setup>
import LakeScene from "../common/LakeScene.vue";
import { publicImageStyle } from "../../utils/publicImage";

defineEmits(["explore"]);
</script>

<template>
  <section class="hero">
    <LakeScene tone="dusk" />
    <div class="home-photo" :style="publicImageStyle('hero.jpg')" aria-hidden="true"></div>
    <div class="fade" aria-hidden="true"></div>
    <span class="home-ring ring" aria-hidden="true"></span>

    <div class="content">
      <h1>
        Aman. Bersih. Terpantau.<br />
        Nikmati Danau Toba dengan Tenang.
      </h1>
      <p class="lead">Cek status kelayakan berenang tiap pantai sebelum Anda berangkat.</p>
      <div class="cta">
        <button type="button" class="home-pill home-pill--outline" @click="$emit('explore')">MULAI JELAJAH ⌄</button>
        <a href="/peta" class="home-pill home-pill--amber">LIHAT PETA</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero { position: relative; min-height: 100vh; max-height: 820px; display: grid; place-items: center; text-align: center; overflow: hidden; color: #fff; }
.ring { width: 560px; height: 560px; right: -200px; bottom: -230px; }
.fade { position: absolute; inset: 0; background:
  radial-gradient(700px 420px at 92% 100%, rgba(19, 122, 115, .75), transparent 70%),
  linear-gradient(180deg, rgba(3, 26, 38, .72) 0%, rgba(3, 26, 38, .5) 45%, var(--bg-0) 100%); }
.content { position: relative; padding: 110px 20px 70px; max-width: 880px; }
h1 { font-size: clamp(1.9rem, 4.6vw, 3.1rem); font-weight: 800; line-height: 1.22; margin-bottom: 14px; }
.lead { font-size: 1.05rem; opacity: .92; margin: 0 0 30px; }
.cta { display: flex; justify-content: center; flex-wrap: wrap; gap: 14px; }
</style>
