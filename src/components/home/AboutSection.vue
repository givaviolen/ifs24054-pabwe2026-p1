<script setup>
import LakeScene from "../common/LakeScene.vue";
import { publicImageStyle } from "../../utils/publicImage";
</script>

<template>
  <section class="home-block about">
    <span class="home-ring ring" aria-hidden="true"></span>
    <div class="text">
      <h2 class="home-accent">Tentang TobaWaterSafe</h2>
      <p>
        <strong>TobaWaterSafe</strong> adalah sistem pemantauan status kelayakan zona berenang dan kondisi
        pesisir Danau Toba berbasis web. Petugas lapangan memperbarui kondisi tiap pantai: sebaran eceng gondok,
        tinggi ombak, dan catatan khusus, sehingga wisatawan tahu kondisi pantai sebelum tiba di lokasi.
      </p>
      <p>
        Danau Toba adalah danau vulkanik terbesar di dunia, dengan panjang sekitar 100 km dan kedalaman
        hingga sekitar 500 m. Di tengahnya berdiri Pulau Samosir, dan kawasan Kaldera Toba telah ditetapkan
        sebagai UNESCO Global Geopark.
      </p>
      <a href="/daftar" class="home-pill home-pill--outline">TELUSURI PANTAI ›</a>
    </div>
    <div class="img">
      <LakeScene tone="day" />
      <div class="home-photo" :style="publicImageStyle('tentang.jpg')" aria-hidden="true"></div>
    </div>
  </section>
</template>

<style scoped>
.about { display: grid; grid-template-columns: 1fr 1fr; gap: 0; align-items: stretch; margin-top: 16px; }
.ring { width: 420px; height: 420px; left: -190px; top: 10px; }
.text { position: relative; z-index: 1; padding: 36px 36px 36px 32px; background: rgba(2, 22, 33, .55); border-radius: 20px 0 0 20px; }
.text p { color: var(--muted); line-height: 1.75; font-size: .92rem; margin: 0 0 14px; }
.text strong { color: #fff; }
.text .home-pill { margin-top: 10px; }
.img { position: relative; min-height: 340px; border-radius: 0 20px 20px 0; overflow: hidden; box-shadow: 0 14px 40px rgba(0, 0, 0, .35); }
@media (max-width: 900px) {
  .about { grid-template-columns: 1fr; }
  .text { border-radius: 20px 20px 0 0; }
  .img { border-radius: 0 0 20px 20px; min-height: 240px; }
}
</style>
