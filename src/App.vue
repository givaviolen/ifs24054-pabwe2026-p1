<script setup>
import { onMounted, watch, computed } from "vue";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import ApiAlert from "./components/ApiAlert.vue";
import SpotDetail from "./components/SpotDetail.vue";
import LoginPanel from "./components/LoginPanel.vue";
import HomeView from "./views/HomeView.vue";
import SpotsView from "./views/SpotsView.vue";
import AdminView from "./views/AdminView.vue";
import { route, go, backPath } from "./composables/useRoute";
import { auth, restoreSession, logout } from "./composables/useAuth";
import { loadSpots } from "./composables/useSpots";
import { PROTECTED } from "./utils/route";

const isProtected = computed(() => PROTECTED.has(route.name));
const isAuthPage = computed(() => route.name === "login" || route.name === "register");

// Penjaga halaman: belum login -> /auth/login, sudah login -> tidak perlu halaman login lagi.
watch(
  [() => route.name, () => auth.ready, () => auth.user],
  () => {
    if (!auth.ready) return;
    if (isProtected.value && !auth.user) go("/auth/login", { replace: true });
    else if (isAuthPage.value && auth.user) go("/petugas", { replace: true });
  },
  { immediate: true }
);

async function doLogout() {
  await logout();
  go("/beranda");
}

onMounted(() => {
  loadSpots();
  restoreSession();
});
</script>

<template>
  <Navbar :current="route.name" :user="auth.user" @logout="doLogout" />

  <HomeView v-if="route.name === 'home'" />

  <main v-else>
    <SpotsView v-if="route.name === 'list' || route.name === 'map'" :mode="route.name" />
    <SpotDetail v-else-if="route.name === 'detail'" :spot-id="route.id" @close="go(backPath())" />

    <p v-else-if="(isProtected || isAuthPage) && !auth.ready" class="muted">Memeriksa sesi…</p>
    <LoginPanel v-else-if="isAuthPage" :mode="route.name" />
    <AdminView v-else-if="isProtected && auth.user" :page="route.name" />

    <section v-else-if="route.name === 'notfound'" class="card nf">
      <h2>Halaman tidak ditemukan</h2>
      <p class="muted">Alamat yang Anda buka tidak ada.</p>
      <a href="/beranda">← Kembali ke beranda</a>
    </section>
  </main>

  <Footer />
  <ApiAlert />
</template>

<style scoped>
.nf { max-width: 480px; margin: 40px auto; text-align: center; }
</style>