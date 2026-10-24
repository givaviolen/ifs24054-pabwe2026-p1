<template>
  <footer class="foot">
    <div class="cols">
      <div>
        <h4>Navigasi</h4>
        <a href="#/beranda">Beranda</a>
        <a href="#/daftar">Daftar Pantai</a>
        <a href="#/peta">Peta Status</a>
      </div>
      <div>
        <h4>Petugas</h4>
        <a href="#/petugas">Login / Registrasi</a>
        <span class="plain">Khusus petugas lapangan dan pengelola pesisir.</span>
      </div>
      <div>
        <h4>Kawasan</h4>
        <span class="plain">Danau Toba, Sumatera Utara</span>
        <span class="plain">Toba · Samosir · Simalungun · Karo · Dairi · Humbang Hasundutan · Tapanuli Utara</span>
      </div>
      <div>
        <h4>Tentang</h4>
        <span class="plain">TobaWaterSafe</span>
        <span class="plain">Proyek 1, Pengembangan Aplikasi Berbasis Web</span>
      </div>
    </div>
    <p class="copy">&copy; 2026 TobaWaterSafe. Informasi diperbarui oleh petugas lapangan; selalu patuhi arahan petugas di lokasi.</p>
  </footer>
</template>

<style scoped>
.foot { margin-top: 24px; padding: 48px 16px 28px; background: rgba(2, 16, 24, .55); border-top: 1px solid var(--line); }
.cols { max-width: 1040px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; }
h4 { font-size: .8rem; letter-spacing: .1em; text-transform: uppercase; color: #fff; margin-bottom: 14px; }
a, .plain { display: block; font-size: .85rem; margin-bottom: 9px; line-height: 1.5; }
a { color: var(--muted); text-decoration: none; }
a:hover { color: var(--accent); }
.plain { color: var(--muted); }
.copy { max-width: 1040px; margin: 32px auto 0; padding-top: 18px; border-top: 1px solid var(--line); text-align: center; font-size: .78rem; color: var(--muted); }
@media (max-width: 800px) { .cols { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .cols { grid-template-columns: 1fr; } }
</style>