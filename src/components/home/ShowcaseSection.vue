<script setup>
import { ref } from "vue";
import LakeScene from "../common/LakeScene.vue";
import { statusMeta } from "../../constants/status";
import { publicImageStyle } from "../../utils/publicImage";

const SLIDE_STEP_PX = 300;

defineProps({
  spots: { type: Array, required: true },
  loading: Boolean,
  hasError: Boolean,
});

const track = ref(null);
const slide = (direction) => track.value?.scrollBy({ left: direction * SLIDE_STEP_PX, behavior: "smooth" });
</script>

<template>
  <section class="home-block">
    <div class="head">
      <div>
        <h2 class="home-accent">Sorotan Pantai</h2>
        <p class="muted">Diurutkan dari yang paling aman saat ini.</p>
      </div>
      <div class="arrows">
        <button type="button" class="round" aria-label="Sebelumnya" @click="slide(-1)">‹</button>
        <button type="button" class="round" aria-label="Berikutnya" @click="slide(1)">›</button>
      </div>
    </div>

    <div class="body">
      <div class="tall">
        <LakeScene tone="dawn" />
        <div class="home-photo" :style="publicImageStyle('pantai.jpg')" aria-hidden="true"></div>
      </div>

      <div ref="track" class="track">
        <article v-for="s in spots" :key="s.id" class="wcard">
          <span class="ico" :class="s.current_status.toLowerCase()" aria-hidden="true">{{ statusMeta(s.current_status).cardIcon }}</span>
          <h3>{{ s.nama_pantai }}</h3>
          <p class="meta">Kabupaten {{ s.kabupaten }} · {{ statusMeta(s.current_status).label }}</p>
          <ul>
            <li>Eceng gondok: {{ s.kondisi_eceng_gondok || "belum ada laporan" }}</li>
            <li>Tinggi ombak: {{ s.tinggi_ombak || "belum ada laporan" }}</li>
            <li>{{ s.is_ramah_anak ? "Ramah anak" : "Kontur lebih dalam" }}</li>
            <li>{{ s.ada_pelampung ? "Ada pelampung" : "Tanpa pelampung" }}</li>
          </ul>
          <a :href="`/pantai/${s.id}`" class="home-pill home-pill--teal">LIHAT DETAIL</a>
        </article>
        <article v-if="!spots.length" class="wcard">
          <h3>{{ loading ? "Memuat data…" : "Data belum tersedia" }}</h3>
          <p class="meta">{{ hasError ? "Data pantai belum dapat dimuat. Gunakan tombol “Coba lagi” di bagian bawah layar." : "Data pantai sedang dimuat." }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 8px; }
.head p { margin: 0; }
.arrows { display: flex; gap: 10px; }
.round { width: 38px; height: 38px; padding: 0; border-radius: 50%; background: transparent; border: 1px solid rgba(255, 255, 255, .6); color: #fff; font-size: 1.3rem; line-height: 1; }
.body { position: relative; display: flex; align-items: center; margin-top: 8px; }
.tall { position: relative; flex: 0 0 280px; height: 360px; border-radius: 20px; overflow: hidden; z-index: 1; box-shadow: 0 14px 40px rgba(0, 0, 0, .35); }
.track { position: relative; z-index: 2; display: flex; gap: 20px; overflow-x: auto; margin-left: -70px; padding: 34px 8px 34px 0; scroll-snap-type: x mandatory; scrollbar-width: none; flex: 1; min-width: 0; }
.track::-webkit-scrollbar { display: none; }
.wcard { flex: 0 0 270px; scroll-snap-align: start; background: #fff; color: #17313e; border-radius: 16px; padding: 22px; box-shadow: 0 10px 30px rgba(0, 0, 0, .35); display: flex; flex-direction: column; min-height: 340px; }
.ico { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; font-size: 1.3rem; margin-bottom: 14px; }
.ico.aman { background: #d9f2e3; } .ico.waspada { background: #fff1c2; } .ico.bahaya { background: #fbd9d9; }
.wcard h3 { font-size: 1.02rem; color: #0f5a4c; margin-bottom: 4px; }
.meta { font-size: .8rem; color: #5b7380; margin: 0 0 12px; }
.wcard ul { list-style: none; margin: 0 0 18px; padding: 0; font-size: .8rem; font-weight: 600; color: #1d7a52; line-height: 1.85; flex: 1; }

@media (max-width: 900px) {
  .tall { flex-basis: 200px; height: 300px; }
  .track { margin-left: -50px; }
}
@media (max-width: 560px) {
  .tall { display: none; }
  .track { margin-left: 0; }
}
</style>
