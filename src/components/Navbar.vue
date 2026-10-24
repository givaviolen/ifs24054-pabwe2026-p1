<script setup>
import { computed } from "vue";

const props = defineProps({ current: String, user: Object });
defineEmits(["logout"]);

const links = [
  { name: "home", href: "/beranda", label: "Beranda" },
  { name: "list", href: "/daftar", label: "Daftar" },
  { name: "map", href: "/peta", label: "Peta" },
];
// Detail pantai = bagian "Daftar"; semua halaman petugas/login = "admin".
const active = computed(() => {
  const c = props.current || "";
  if (c === "detail") return "list";
  if (c.startsWith("admin") || c === "login" || c === "register") return "admin";
  return c;
});
</script>

<template>
  <header class="nav">
    <a class="brand" href="/beranda">🌊 TobaWaterSafe</a>

    <nav class="links" aria-label="Menu utama">
      <a v-for="l in links" :key="l.name" :href="l.href" class="item" :class="{ on: active === l.name }">
        {{ l.label }}
      </a>
    </nav>

    <div class="right">
      <template v-if="user">
        <span class="who">{{ user.nama }}</span>
        <button class="ghost out" @click="$emit('logout')">Keluar</button>
      </template>
      <a :href="user ? '/petugas' : '/auth/login'" class="pill" :class="{ on: active === 'admin' }">
        {{ user ? "Panel Petugas" : "Login Petugas" }}
      </a>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px;
  padding: 14px 32px;
  background: linear-gradient(180deg, rgba(3, 26, 38, .9), rgba(3, 26, 38, .55));
  backdrop-filter: blur(8px);
}
.brand { color: #fff; font-weight: 800; font-size: 1.15rem; text-decoration: none; letter-spacing: .01em; }
.links { display: flex; gap: 30px; }
.item { color: #fff; text-decoration: none; font-size: .86rem; letter-spacing: .04em; opacity: .88; padding: 6px 2px; border-bottom: 2px solid transparent; }
.item:hover { opacity: 1; }
.item.on { color: var(--accent); opacity: 1; border-bottom-color: var(--accent); }
.right { justify-self: end; display: flex; align-items: center; gap: 10px; }
.who { color: var(--muted); font-size: .85rem; }
.out { padding: 7px 14px; color: #fff; border-color: rgba(255, 255, 255, .6); }
.pill { color: #fff; text-decoration: none; font-size: .85rem; padding: 9px 22px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, .7); }
.pill:hover { background: rgba(255, 255, 255, .14); border-color: var(--accent); }
.pill.on { background: rgba(92, 225, 200, .18); border-color: var(--accent); }

@media (max-width: 820px) {
  .nav { grid-template-columns: 1fr auto; padding: 10px 14px; row-gap: 6px; }
  .links { grid-column: 1 / -1; order: 3; justify-content: center; gap: 22px; }
}
</style>