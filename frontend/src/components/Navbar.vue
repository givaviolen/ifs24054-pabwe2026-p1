<script setup>
import { computed } from "vue";

const props = defineProps({ current: String, user: Object });
defineEmits(["logout"]);

const links = [
  { name: "home", href: "#/beranda", label: "Beranda" },
  { name: "list", href: "#/daftar", label: "Daftar" },
  { name: "map", href: "#/peta", label: "Peta" },
];
// Halaman detail pantai dianggap bagian dari "Daftar".
const active = computed(() => (props.current === "detail" ? "list" : props.current));
</script>

<template>
  <header class="nav">
    <a class="brand" href="#/beranda">🌊 TobaWaterSafe</a>
    <nav>
      <a v-for="l in links" :key="l.name" :href="l.href" class="item" :class="{ on: active === l.name }">
        {{ l.label }}
      </a>
      <a href="#/petugas" class="item petugas" :class="{ on: active === 'admin' }">
        {{ user ? "Panel Petugas" : "Login Petugas" }}
      </a>
      <template v-if="user">
        <span class="who">{{ user.nama }}</span>
        <button class="ghost" @click="$emit('logout')">Keluar</button>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.nav { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px 16px; padding: 10px 20px; background: #fff; border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 20; }
.brand { color: var(--primary); font-weight: 700; font-size: 1.1rem; text-decoration: none; }
nav { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.item { color: var(--text); text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: .95rem; }
.item:hover { background: #eaf3f7; }
.item.on { background: var(--primary); color: #fff; }
.petugas { border: 1px solid var(--primary); color: var(--primary); margin-left: 6px; }
.petugas.on { color: #fff; }
.who { color: var(--muted); font-size: .9rem; margin: 0 4px 0 8px; }
</style>
