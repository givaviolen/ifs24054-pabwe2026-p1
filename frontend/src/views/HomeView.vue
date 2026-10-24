<script setup>
import { computed } from "vue";
import { allSpots, error } from "../composables/useSpots";

// Statistik dihitung langsung dari data API.
const stats = computed(() => {
  const list = allSpots.value;
  const count = (s) => list.filter((x) => x.current_status === s).length;
  return {
    total: list.length,
    aman: count("AMAN"),
    waspada: count("WASPADA"),
    bahaya: count("BAHAYA"),
    kabupaten: new Set(list.map((x) => x.kabupaten)).size,
  };
});

const featured = computed(() => allSpots.value.filter((s) => s.current_status === "AMAN").slice(0, 3));

const problems = [
  { icon: "🌿", title: "Eceng gondok berpindah cepat", text: "Terbawa angin danau, eceng gondok dapat menutup bibir pantai hanya dalam hitungan jam sehingga pantai tidak layak untuk berenang." },
  { icon: "🌊", title: "Kedalaman tidak merata", text: "Sebagian pesisir memiliki dasar yang curam mendadak. Ini berbahaya bagi anak-anak dan wisatawan yang belum mahir berenang." },
  { icon: "📡", title: "Informasi sering terlambat", text: "Kabar dari mulut ke mulut membuat wisatawan baru tahu pantai kotor atau berbahaya setelah tiba di lokasi." },
];

const facts = [
  { value: "±100 km", label: "panjang danau, dengan lebar sekitar 30 km" },
  { value: "±500 m", label: "kedalaman maksimum di bagian terdalam" },
  { value: "±900 m", label: "di atas permukaan laut, sehingga udaranya sejuk" },
  { value: "±74.000", label: "tahun lalu danau terbentuk dari letusan supervolkano" },
];

const statuses = [
  { cls: "aman", icon: "🟢", title: "Aman & Bersih", text: "Air jernih, bebas eceng gondok, dan ombak tenang. Nyaman untuk berenang." },
  { cls: "waspada", icon: "🟡", title: "Waspada", text: "Ada sebaran eceng gondok tipis atau ombak sedang. Berenang dengan ekstra hati-hati." },
  { cls: "bahaya", icon: "🔴", title: "Bahaya / Tutup Sementara", text: "Eceng gondok pekat, cuaca ekstrem, atau air sangat dalam tanpa pembatas. Jangan berenang." },
];

const tips = [
  "Cek status pantai di TobaWaterSafe sebelum berangkat.",
  "Dampingi anak-anak sepanjang waktu, terutama di pantai berkontur curam.",
  "Gunakan pelampung, walaupun Anda merasa mahir berenang.",
  "Hindari berenang saat ombak tinggi atau eceng gondok pekat menutup pantai.",
  "Patuhi arahan petugas dan catatan kondisi terbaru di halaman detail pantai.",
];

// Tempat foto. Letakkan file di frontend/public/images/ dengan nama di bawah ini;
// bila belum ada, ilustrasi bawaan tetap tampil.
const gallery = [
  { src: "/images/galeri-1.jpg", title: "Panorama Danau Toba", icon: "🌅", tone: "t1" },
  { src: "/images/galeri-2.jpg", title: "Pulau Samosir", icon: "🏝️", tone: "t2" },
  { src: "/images/galeri-3.jpg", title: "Pesisir Balige", icon: "🏖️", tone: "t3" },
  { src: "/images/galeri-4.jpg", title: "Senja di Parapat", icon: "⛰️", tone: "t4" },
];
const hideBroken = (e) => { e.target.style.display = "none"; };
</script>

<template>
  <div class="home">
    <!-- ================= HERO ================= -->
    <section class="hero">
      <!-- Ilustrasi bawaan (selalu tampil). Foto hero.jpg, bila ada, menutupinya. -->
      <svg class="scene" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="tws-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0b3d5c" />
            <stop offset=".55" stop-color="#2a7fa8" />
            <stop offset="1" stop-color="#f6c58b" />
          </linearGradient>
          <linearGradient id="tws-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#1b7f9f" />
            <stop offset="1" stop-color="#062f47" />
          </linearGradient>
        </defs>
        <rect width="1200" height="520" fill="url(#tws-sky)" />
        <circle cx="880" cy="300" r="64" fill="#ffe3a8" opacity=".95" />
        <path d="M0 340 L110 250 L230 315 L340 215 L470 325 L570 270 L720 345 L0 345Z" fill="#14506f" opacity=".8" />
        <path d="M480 345 L640 255 L770 335 L910 235 L1050 325 L1200 265 L1200 355 L480 355Z" fill="#0f4560" opacity=".85" />
        <path d="M0 355 L200 305 L420 350 L650 312 L880 352 L1200 318 L1200 370 L0 370Z" fill="#0a3550" />
        <rect y="350" width="1200" height="170" fill="url(#tws-water)" />
        <rect x="835" y="360" width="90" height="5" rx="2.5" fill="#ffe3a8" opacity=".55" />
        <rect x="850" y="376" width="60" height="4" rx="2" fill="#ffe3a8" opacity=".4" />
        <rect x="862" y="390" width="36" height="3" rx="1.5" fill="#ffe3a8" opacity=".3" />
        <path d="M0 410 Q75 398 150 410 T300 410 T450 410 T600 410 T750 410 T900 410 T1050 410 T1200 410" stroke="#fff" stroke-opacity=".22" fill="none" stroke-width="2" />
        <path d="M0 450 Q75 438 150 450 T300 450 T450 450 T600 450 T750 450 T900 450 T1050 450 T1200 450" stroke="#fff" stroke-opacity=".16" fill="none" stroke-width="2" />
        <path d="M0 490 Q75 478 150 490 T300 490 T450 490 T600 490 T750 490 T900 490 T1050 490 T1200 490" stroke="#fff" stroke-opacity=".12" fill="none" stroke-width="2" />
      </svg>
      <div class="photo" aria-hidden="true"></div>
      <div class="shade" aria-hidden="true"></div>

      <div class="wrap hero-content">
        <p class="eyebrow">Pemantauan perairan pesisir Danau Toba</p>
        <h1>Berenang aman, liburan tenang di Danau Toba</h1>
        <p class="lead">
          Lihat status kelayakan berenang tiap pantai sebelum Anda berangkat: kebersihan air,
          eceng gondok, tinggi ombak, hingga fasilitas keselamatan, diperbarui langsung oleh petugas lapangan.
        </p>
        <div class="cta">
          <a href="#/peta" class="btn primary">🗺️ Lihat Peta Pantai</a>
          <a href="#/daftar" class="btn outline">📋 Telusuri Daftar</a>
        </div>

        <p v-if="error" class="notice-light">{{ error }}</p>
        <ul class="chips">
          <li><strong>{{ stats.total }}</strong> pantai dipantau</li>
          <li><strong>{{ stats.kabupaten }}</strong> kabupaten</li>
          <li><span class="dot aman"></span><strong>{{ stats.aman }}</strong> aman</li>
          <li><span class="dot waspada"></span><strong>{{ stats.waspada }}</strong> waspada</li>
          <li><span class="dot bahaya"></span><strong>{{ stats.bahaya }}</strong> bahaya</li>
        </ul>
      </div>
    </section>

    <!-- ================= PANTAI PILIHAN ================= -->
    <section v-if="featured.length" class="section wrap">
      <h2>Pantai yang aman hari ini</h2>
      <p class="sub">Beberapa pantai dengan status hijau saat ini.</p>
      <div class="featured">
        <a v-for="s in featured" :key="s.id" :href="`#/pantai/${s.id}`" class="fcard">
          <span class="badge aman">🟢 Aman Berenang</span>
          <h3>{{ s.nama_pantai }}</h3>
          <p>Kabupaten {{ s.kabupaten }}</p>
          <small>
            {{ s.is_ramah_anak ? "✅ Ramah anak" : "⚠️ Kontur lebih dalam" }} ·
            {{ s.ada_pelampung ? "🛟 Ada pelampung" : "Tanpa pelampung" }}
          </small>
        </a>
      </div>
    </section>

    <!-- ================= MENGENAL DANAU TOBA ================= -->
    <section class="section tint">
      <div class="wrap">
        <h2>Mengenal Danau Toba</h2>
        <p class="sub">
          Danau vulkanik terbesar di dunia, di jantung Sumatera Utara. Di tengahnya berdiri Pulau Samosir,
          dan di sekelilingnya terdapat tujuh kabupaten: Toba, Samosir, Simalungun, Karo, Dairi,
          Humbang Hasundutan, dan Tapanuli Utara. Kawasan Kaldera Toba telah ditetapkan sebagai
          UNESCO Global Geopark.
        </p>
        <div class="facts">
          <div v-for="f in facts" :key="f.value" class="fact">
            <strong>{{ f.value }}</strong>
            <span>{{ f.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= GALERI ================= -->
    <section class="section wrap">
      <h2>Pesona pesisir Toba</h2>
      <p class="sub">Air biru, perbukitan hijau, dan senja yang tenang.</p>
      <div class="gallery">
        <figure v-for="g in gallery" :key="g.src" :class="['tile', g.tone]">
          <span class="ico" aria-hidden="true">{{ g.icon }}</span>
          <img :src="g.src" :alt="g.title" loading="lazy" @error="hideBroken" />
          <figcaption>{{ g.title }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- ================= MASALAH YANG DIJAWAB ================= -->
    <section class="section tint">
      <div class="wrap">
        <h2>Mengapa TobaWaterSafe?</h2>
        <p class="sub">Tiga masalah nyata yang dihadapi wisatawan air di Danau Toba.</p>
        <div class="problems">
          <article v-for="p in problems" :key="p.title" class="pcard">
            <span class="picon" aria-hidden="true">{{ p.icon }}</span>
            <h3>{{ p.title }}</h3>
            <p>{{ p.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ================= CARA MEMBACA STATUS ================= -->
    <section class="section wrap">
      <h2>Cara membaca status pantai</h2>
      <p class="sub">Setiap pantai ditandai dengan tiga warna.</p>
      <div class="statuses">
        <article v-for="s in statuses" :key="s.cls" :class="['scard', s.cls]">
          <h3>{{ s.icon }} {{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </article>
      </div>
    </section>

    <!-- ================= TIPS KESELAMATAN ================= -->
    <section class="section tint">
      <div class="wrap tips-wrap">
        <div>
          <h2>Tips keselamatan berenang</h2>
          <p class="sub">Agar liburan tetap menyenangkan.</p>
        </div>
        <ul class="tips">
          <li v-for="t in tips" :key="t">{{ t }}</li>
        </ul>
      </div>
    </section>

    <!-- ================= AJAKAN ================= -->
    <section class="closing">
      <div class="wrap">
        <h2>Siap berangkat?</h2>
        <p>Pilih pantai, cek kondisinya, lalu nikmati Danau Toba dengan tenang.</p>
        <a href="#/daftar" class="btn primary">Lihat semua pantai</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.wrap { max-width: 1040px; margin: 0 auto; padding: 0 16px; }
.section { padding: 56px 0; }
.section.tint { background: #e9f3f8; }
h2 { font-size: 1.7rem; margin: 0 0 6px; }
.sub { color: var(--muted); max-width: 760px; line-height: 1.6; margin: 0 0 28px; }

/* ---------- hero ---------- */
.hero { position: relative; min-height: 600px; display: flex; align-items: center; color: #fff; overflow: hidden; }
.scene { position: absolute; inset: 0; width: 100%; height: 100%; }
.photo { position: absolute; inset: 0; background: url("/images/hero.jpg") center / cover no-repeat; }
.shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(4, 30, 48, .82) 0%, rgba(4, 30, 48, .5) 55%, rgba(4, 30, 48, .15) 100%); }
.hero-content { position: relative; padding-top: 72px; padding-bottom: 72px; width: 100%; }
.eyebrow { text-transform: uppercase; letter-spacing: .14em; font-size: .8rem; opacity: .9; margin: 0 0 12px; }
.hero h1 { font-size: clamp(2rem, 5vw, 3.4rem); line-height: 1.1; margin: 0 0 16px; max-width: 700px; }
.lead { font-size: 1.1rem; line-height: 1.65; max-width: 620px; margin: 0 0 28px; opacity: .95; }
.cta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 32px; }
.btn { display: inline-block; padding: 12px 22px; border-radius: 10px; font-weight: 600; text-decoration: none; }
.btn.primary { background: #ffb547; color: #3a2400; }
.btn.primary:hover { background: #ffc46b; }
.btn.outline { border: 2px solid rgba(255, 255, 255, .85); color: #fff; }
.btn.outline:hover { background: rgba(255, 255, 255, .15); }
.notice-light { background: rgba(211, 58, 58, .85); padding: 8px 12px; border-radius: 8px; display: inline-block; }
.chips { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 10px; }
.chips li { background: rgba(255, 255, 255, .15); backdrop-filter: blur(6px); border: 1px solid rgba(255, 255, 255, .3); padding: 8px 14px; border-radius: 999px; font-size: .92rem; display: flex; align-items: center; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot.aman { background: #3ddc84; } .dot.waspada { background: #ffd23f; } .dot.bahaya { background: #ff5a5a; }

/* ---------- pantai pilihan ---------- */
.featured { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.fcard { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 20px; text-decoration: none; color: var(--text); transition: transform .15s, box-shadow .15s; display: block; }
.fcard:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(11, 110, 143, .15); }
.fcard h3 { margin: 10px 0 4px; }
.fcard p { margin: 0 0 8px; color: var(--muted); }
.fcard small { color: var(--muted); }
.badge { display: inline-block; font-size: .78rem; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
.badge.aman { background: #dff5e8; color: #14693a; }

/* ---------- fakta ---------- */
.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; }
.fact { background: #fff; border-radius: 14px; padding: 22px; border: 1px solid var(--line); }
.fact strong { display: block; font-size: 1.9rem; color: var(--primary); margin-bottom: 6px; }
.fact span { color: var(--muted); line-height: 1.5; }

/* ---------- galeri ---------- */
.gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.tile { position: relative; margin: 0; height: 240px; border-radius: 14px; overflow: hidden; display: grid; place-items: center; }
.tile.t1 { background: linear-gradient(160deg, #0b3d5c, #f6a65b); }
.tile.t2 { background: linear-gradient(160deg, #1b7f9f, #7bc67e); }
.tile.t3 { background: linear-gradient(160deg, #2a7fa8, #cfe9f2); }
.tile.t4 { background: linear-gradient(160deg, #3a2a5c, #ff9a5a); }
.ico { font-size: 3rem; opacity: .85; }
.tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.tile figcaption { position: absolute; left: 0; right: 0; bottom: 0; padding: 28px 14px 12px; color: #fff; font-weight: 600; background: linear-gradient(transparent, rgba(0, 0, 0, .6)); }

/* ---------- masalah ---------- */
.problems { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.pcard { background: #fff; border-radius: 14px; padding: 24px; border: 1px solid var(--line); }
.picon { font-size: 2rem; }
.pcard h3 { margin: 10px 0 8px; }
.pcard p { margin: 0; color: var(--muted); line-height: 1.6; }

/* ---------- status ---------- */
.statuses { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.scard { border-radius: 14px; padding: 22px; border-left: 6px solid; background: #fff; border-top: 1px solid var(--line); border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.scard h3 { margin: 0 0 8px; }
.scard p { margin: 0; color: var(--muted); line-height: 1.6; }
.scard.aman { border-left-color: var(--aman); }
.scard.waspada { border-left-color: #f2b705; }
.scard.bahaya { border-left-color: var(--bahaya); }

/* ---------- tips ---------- */
.tips-wrap { display: grid; grid-template-columns: 1fr 1.4fr; gap: 32px; align-items: start; }
.tips { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
.tips li { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px 14px 44px; position: relative; line-height: 1.5; }
.tips li::before { content: "✓"; position: absolute; left: 16px; color: var(--aman); font-weight: 700; }

/* ---------- penutup ---------- */
.closing { background: linear-gradient(120deg, #0b3d5c, #0b6e8f); color: #fff; text-align: center; padding: 56px 0; }
.closing h2 { font-size: 2rem; }
.closing p { opacity: .9; margin: 0 0 22px; }

@media (max-width: 800px) {
  .gallery { grid-template-columns: repeat(2, 1fr); }
  .tips-wrap { grid-template-columns: 1fr; }
  .hero { min-height: 520px; }
  .shade { background: rgba(4, 30, 48, .6); }
}
</style>
