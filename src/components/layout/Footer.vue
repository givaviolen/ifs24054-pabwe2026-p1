<script setup>
const kawasan = ["Toba", "Samosir", "Simalungun", "Karo", "Dairi", "Humbang Hasundutan", "Tapanuli Utara"];
</script>

<template>
  <footer class="foot">
    <div class="cols">
      <div class="brand">
        <strong class="logo">🌊 TobaWaterSafe</strong>
        <p>Pemantauan status kelayakan zona berenang dan kondisi pesisir Danau Toba.</p>
      </div>

      <nav aria-label="Navigasi footer">
        <h4>Navigasi</h4>
        <a href="/beranda">Beranda</a>
        <a href="/daftar">Daftar Pantai</a>
        <a href="/peta">Peta Status</a>
      </nav>

      <div>
        <h4>Petugas</h4>
        <a href="/auth/login">Login</a>
        <a href="/auth/register">Registrasi</a>
        <span class="plain">Khusus petugas lapangan dan pengelola pesisir.</span>
      </div>

      <div>
        <h4>Kawasan</h4>
        <ul class="chips">
          <li v-for="k in kawasan" :key="k">{{ k }}</li>
        </ul>
      </div>
    </div>

    <div class="bar">
      <span>&copy; 2026 TobaWaterSafe</span>
      <span>Proyek 1 · Pengembangan Aplikasi Berbasis Web</span>
    </div>
  </footer>
</template>

<style scoped>
.foot { margin-top: 32px; padding: 48px 16px 22px; background: rgba(2, 16, 24, .65); border-top: 1px solid var(--line); }
.cols { max-width: 1040px; margin: 0 auto; display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.3fr; gap: 32px; }
.logo { display: block; font-family: var(--font-head); font-size: 1.15rem; color: #fff; margin-bottom: 10px; }
.brand p { margin: 0; font-size: .85rem; line-height: 1.6; color: var(--muted); max-width: 280px; }
h4 { font-size: .78rem; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); margin-bottom: 14px; }
a, .plain { display: block; font-size: .88rem; margin-bottom: 10px; line-height: 1.5; }
a { color: var(--text); text-decoration: none; }
a:hover { color: var(--accent); }
.plain { color: var(--muted); }
.chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.chips li { font-size: .78rem; padding: 4px 11px; border-radius: 999px; color: var(--text);
  background: rgba(92, 225, 200, .10); border: 1px solid rgba(92, 225, 200, .28); }
.bar { max-width: 1040px; margin: 34px auto 0; padding-top: 18px; border-top: 1px solid var(--line);
  display: flex; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; font-size: .8rem; color: var(--muted); }
@media (max-width: 860px) { .cols { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .cols { grid-template-columns: 1fr; } .bar { flex-direction: column; } }
</style>