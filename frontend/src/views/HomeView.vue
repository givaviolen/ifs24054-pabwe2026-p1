<script setup>
import { ref, computed } from "vue";
import LakeScene from "../components/LakeScene.vue";
import { allSpots, error, filters, resetFilters } from "../composables/useSpots";
import { go } from "../composables/useRoute";

const showcaseEl = ref(null);
const track = ref(null);

// ---------- data langsung dari API ----------
const stats = computed(() => {
  const list = allSpots.value;
  const count = (s) => list.filter((x) => x.current_status === s).length;
  return {
    total: list.length,
    kabupaten: new Set(list.map((x) => x.kabupaten)).size,
    aman: count("AMAN"),
    perlu: count("WASPADA") + count("BAHAYA"),
  };
});

const statCards = computed(() => [
  { value: stats.value.total, label: "Pantai dipantau", text: "Titik pesisir di sekitar Danau Toba yang datanya diperbarui petugas." },
  { value: stats.value.kabupaten, label: "Kabupaten tercakup", text: "Wilayah pesisir yang saat ini sudah memiliki data pantai." },
  { value: stats.value.aman, label: "Pantai aman", text: "Berstatus hijau: air bersih dan ombak tenang." },
  { value: stats.value.perlu, label: "Perlu kewaspadaan", text: "Berstatus kuning atau merah. Periksa detailnya sebelum berenang." },
]);

// Sorotan: urut dari yang paling aman.
const ORDER = { AMAN: 0, WASPADA: 1, BAHAYA: 2 };
const showcase = computed(() =>
  [...allSpots.value].sort((a, b) => ORDER[a.current_status] - ORDER[b.current_status]).slice(0, 8)
);
const STATUS = {
  AMAN: { label: "Aman Berenang", icon: "🏊", cls: "aman" },
  WASPADA: { label: "Waspada", icon: "⚠️", cls: "waspada" },
  BAHAYA: { label: "Bahaya / Tutup", icon: "⛔", cls: "bahaya" },
};

const slide = (dir) => track.value?.scrollBy({ left: dir * 300, behavior: "smooth" });
const scrollDown = () => showcaseEl.value?.scrollIntoView({ behavior: "smooth", block: "start" });

// ---------- edukasi: tiap kolom membuka daftar/peta dengan filter yang relevan ----------
const edu = [
  { tag: "Eceng gondok", title: "Kenali eceng gondok yang berpindah", text: "Angin dapat menggeser eceng gondok ke bibir pantai dalam hitungan jam. Status hijau berarti perairannya bersih dari sebaran pekat.", action: "Lihat pantai aman", patch: { status: "AMAN" }, path: "/daftar" },
  { tag: "Kedalaman", title: "Waspadai dasar yang curam", text: "Sebagian pesisir turun mendadak. Untuk keluarga dengan anak, pilih pantai berkontur landai dan tetap dampingi anak.", action: "Pantai ramah anak", patch: { ramah_anak: true }, path: "/daftar" },
  { tag: "Cuaca & ombak", title: "Pantau ombak sebelum berangkat", text: "Angin kencang membuat ombak naik. Cek catatan terbaru petugas dan peta status sebelum turun ke air.", action: "Buka peta status", patch: {}, path: "/peta" },
  { tag: "Perlengkapan", title: "Gunakan pelampung", text: "Pelampung mengurangi risiko, terutama bagi yang belum mahir berenang. Pilih pantai yang menyediakan sewa atau pos pelampung.", action: "Pantai berpelampung", patch: { ada_pelampung: true }, path: "/daftar" },
];
function openWith(patch, path) {
  resetFilters();
  Object.assign(filters, patch);
  go(path);
}

// ---------- foto: letakkan di frontend/public/images/. Bila tidak ada, ilustrasi bawaan tampil ----------
const photo = (name) => ({ backgroundImage: `url(/images/${name})` });
</script>

<template>
  <div class="home">
    <!-- ================= HERO ================= -->
    <section class="hero">
      <LakeScene tone="dusk" />
      <div class="photo" :style="photo('hero.jpg')" aria-hidden="true"></div>
      <div class="fade" aria-hidden="true"></div>
      <span class="ring ring-hero" aria-hidden="true"></span>

      <div class="hero-content">
        <h1>
          Aman. Bersih. Terpantau.<br />
          Nikmati Danau Toba dengan Tenang.
        </h1>
        <p class="lead">Cek status kelayakan berenang tiap pantai sebelum Anda berangkat.</p>
        <div class="cta">
          <button type="button" class="pill outline" @click="scrollDown">MULAI JELAJAH ⌄</button>
          <a href="#/peta" class="pill amber">LIHAT PETA</a>
        </div>
        <p v-if="error" class="warn">{{ error }}</p>
      </div>
    </section>

    <!-- ================= SOROTAN PANTAI ================= -->
    <section ref="showcaseEl" class="block showcase">
      <div class="head">
        <div>
          <h2 class="accent">Sorotan Pantai</h2>
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
          <div class="photo" :style="photo('pantai.jpg')" aria-hidden="true"></div>
        </div>

        <div ref="track" class="track">
          <article v-for="s in showcase" :key="s.id" class="wcard">
            <span class="ico" :class="STATUS[s.current_status].cls" aria-hidden="true">{{ STATUS[s.current_status].icon }}</span>
            <h3>{{ s.nama_pantai }}</h3>
            <p class="meta">Kabupaten {{ s.kabupaten }} · {{ STATUS[s.current_status].label }}</p>
            <ul>
              <li>Eceng gondok: {{ s.kondisi_eceng_gondok || "belum ada laporan" }}</li>
              <li>Tinggi ombak: {{ s.tinggi_ombak || "belum ada laporan" }}</li>
              <li>{{ s.is_ramah_anak ? "Ramah anak" : "Kontur lebih dalam" }}</li>
              <li>{{ s.ada_pelampung ? "Ada pelampung" : "Tanpa pelampung" }}</li>
            </ul>
            <a :href="`#/pantai/${s.id}`" class="pill teal">LIHAT DETAIL</a>
          </article>
          <article v-if="!showcase.length" class="wcard">
            <h3>Data belum tersedia</h3>
            <p class="meta">Pastikan Back-End berjalan, lalu muat ulang halaman.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ================= STATISTIK ================= -->
    <section class="block stats">
      <div v-for="c in statCards" :key="c.label" class="stat">
        <strong>{{ c.value }}</strong>
        <h4>{{ c.label }}</h4>
        <p>{{ c.text }}</p>
      </div>
    </section>

    <!-- ================= TENTANG ================= -->
    <section class="block about">
      <span class="ring ring-about" aria-hidden="true"></span>
      <div class="about-text">
        <h2 class="accent">Tentang TobaWaterSafe</h2>
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
        <a href="#/daftar" class="pill outline">TELUSURI PANTAI ›</a>
      </div>
      <div class="about-img">
        <LakeScene tone="day" />
        <div class="photo" :style="photo('tentang.jpg')" aria-hidden="true"></div>
      </div>
    </section>

    <!-- ================= EDUKASI (4 KOLOM) ================= -->
    <section class="block edu">
      <article v-for="e in edu" :key="e.title" class="col">
        <span class="tag">{{ e.tag }}</span>
        <h3>{{ e.title }}</h3>
        <p>{{ e.text }}</p>
        <button type="button" class="pill lime" @click="openWith(e.patch, e.path)">{{ e.action }}</button>
      </article>
    </section>
  </div>
</template>

<style scoped>
.block { max-width: 1040px; margin: 0 auto; padding: 56px 16px; position: relative; }
.accent { color: var(--accent); font-size: 1.8rem; }

/* ---------- pill buttons ---------- */
.pill { display: inline-block; padding: 11px 26px; border-radius: 999px; font-size: .78rem; letter-spacing: .08em; text-decoration: none; border: 1px solid transparent; cursor: pointer; font-family: inherit; text-transform: uppercase; }
.pill.outline { background: transparent; color: #fff; border-color: rgba(255, 255, 255, .8); }
.pill.outline:hover { background: rgba(255, 255, 255, .14); }
.pill.amber { background: var(--amber); color: #3a2400; font-weight: 700; }
.pill.amber:hover { background: #ffc46b; }
.pill.teal { background: #14705f; color: #fff; }
.pill.lime { background: var(--accent); color: #04302a; font-weight: 700; text-transform: none; letter-spacing: .02em; font-size: .85rem; padding: 10px 22px; }

/* ---------- ring dekoratif ---------- */
.ring { position: absolute; border: 1px solid rgba(255, 255, 255, .22); border-radius: 50%; pointer-events: none; }
.ring-hero { width: 560px; height: 560px; right: -200px; bottom: -230px; }
.ring-about { width: 420px; height: 420px; left: -190px; top: 10px; }

/* ---------- hero ---------- */
.hero { position: relative; min-height: 100vh; max-height: 820px; display: grid; place-items: center; text-align: center; overflow: hidden; color: #fff; }
.photo { position: absolute; inset: 0; background-size: cover; background-position: center; background-repeat: no-repeat; }
.fade { position: absolute; inset: 0; background:
  radial-gradient(700px 420px at 92% 100%, rgba(19, 122, 115, .75), transparent 70%),
  linear-gradient(180deg, rgba(3, 26, 38, .72) 0%, rgba(3, 26, 38, .5) 45%, var(--bg-0) 100%); }
.hero-content { position: relative; padding: 110px 20px 70px; max-width: 880px; }
.hero h1 { font-size: clamp(1.9rem, 4.6vw, 3.1rem); font-weight: 800; line-height: 1.22; margin-bottom: 14px; }
.lead { font-size: 1.05rem; opacity: .92; margin: 0 0 30px; }
.cta { display: flex; justify-content: center; flex-wrap: wrap; gap: 14px; }
.warn { margin-top: 24px; display: inline-block; background: rgba(211, 58, 58, .85); padding: 8px 14px; border-radius: 10px; }

/* ---------- sorotan ---------- */
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 8px; }
.head p { margin: 0; }
.arrows { display: flex; gap: 10px; }
.round { width: 38px; height: 38px; padding: 0; border-radius: 50%; background: transparent; border: 1px solid rgba(255, 255, 255, .6); color: #fff; font-size: 1.3rem; line-height: 1; }
.body { position: relative; display: flex; align-items: center; margin-top: 8px; }
.tall { position: relative; flex: 0 0 280px; height: 360px; border-radius: 20px; overflow: hidden; z-index: 1; box-shadow: 0 14px 40px rgba(0, 0, 0, .35); }
.track { position: relative; z-index: 2; display: flex; gap: 20px; overflow-x: auto; margin-left: -70px; padding: 34px 8px 34px 0; scroll-snap-type: x mandatory; scrollbar-width: none; flex: 1; min-width: 0; }
.track::-webkit-scrollbar { display: none; }
.wcard { flex: 0 0 270px; scroll-snap-align: start; background: #fff; color: #17313e; border-radius: 16px; padding: 22px; box-shadow: 0 10px 30px rgba(0, 0, 0, .35); display: flex; flex-direction: column; }
.ico { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; font-size: 1.3rem; margin-bottom: 14px; }
.ico.aman { background: #d9f2e3; } .ico.waspada { background: #fff1c2; } .ico.bahaya { background: #fbd9d9; }
.wcard h3 { font-size: 1.02rem; color: #0f5a4c; margin-bottom: 4px; }
.meta { font-size: .8rem; color: #5b7380; margin: 0 0 12px; }
.wcard ul { list-style: none; margin: 0 0 18px; padding: 0; font-size: .8rem; font-weight: 600; color: #1d7a52; line-height: 1.85; flex: 1; }

/* ---------- statistik ---------- */
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; padding-top: 24px; }
.stat strong { display: block; font-size: 2.3rem; color: var(--accent); font-weight: 800; }
.stat h4 { font-size: .95rem; color: #fff; margin: 4px 0 8px; }
.stat p { margin: 0; font-size: .82rem; color: var(--muted); line-height: 1.6; }

/* ---------- tentang ---------- */
.about { display: grid; grid-template-columns: 1fr 1fr; gap: 0; align-items: stretch; margin-top: 16px; }
.about-text { position: relative; z-index: 1; padding: 36px 36px 36px 32px; background: rgba(2, 22, 33, .55); border-radius: 20px 0 0 20px; }
.about-text p { color: var(--muted); line-height: 1.75; font-size: .92rem; margin: 0 0 14px; }
.about-text strong { color: #fff; }
.about-text .pill { margin-top: 10px; }
.about-img { position: relative; min-height: 340px; border-radius: 0 20px 20px 0; overflow: hidden; box-shadow: 0 14px 40px rgba(0, 0, 0, .35); }

/* ---------- edukasi 4 kolom ---------- */
.edu { display: grid; grid-template-columns: repeat(4, 1fr); padding-top: 24px; }
.col { padding: 8px 24px; border-left: 1px solid var(--line); display: flex; flex-direction: column; }
.col:first-child { border-left: 0; padding-left: 0; }
.tag { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
.col h3 { color: var(--accent); font-size: 1.02rem; }
.col p { color: var(--muted); font-size: .84rem; line-height: 1.7; flex: 1; margin: 6px 0 18px; }
.col .pill { align-self: flex-start; }

@media (max-width: 900px) {
  .stats { grid-template-columns: 1fr 1fr; }
  .edu { grid-template-columns: 1fr 1fr; row-gap: 28px; }
  .col:nth-child(3) { border-left: 0; padding-left: 0; }
  .about { grid-template-columns: 1fr; }
  .about-text { border-radius: 20px 20px 0 0; }
  .about-img { border-radius: 0 0 20px 20px; min-height: 240px; }
  .tall { flex-basis: 200px; height: 300px; }
  .track { margin-left: -50px; }
}
@media (max-width: 560px) {
  .edu { grid-template-columns: 1fr; }
  .col { border-left: 0; padding-left: 0; }
  .tall { display: none; }
  .track { margin-left: 0; }
}
</style>