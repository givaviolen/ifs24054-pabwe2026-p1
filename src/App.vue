<script setup>
import { defineAsyncComponent, onMounted } from "vue";
import Navbar from "./components/layout/Navbar.vue";
import Footer from "./components/layout/Footer.vue";
import ApiAlert from "./components/common/ApiAlert.vue";
import HomeView from "./views/HomeView.vue";
import { route, go, backPath } from "./composables/useRoute";
import { auth, restoreSession, logout } from "./composables/useAuth";
import { useRouteGuard } from "./composables/useRouteGuard";
import { loadSpots } from "./composables/useSpots";

// Halaman selain beranda dimuat saat dibutuhkan agar bundel awal lebih kecil.
const SpotsView = defineAsyncComponent(() => import("./views/SpotsView.vue"));
const SpotDetail = defineAsyncComponent(() => import("./components/spots/SpotDetail.vue"));
const LoginPanel = defineAsyncComponent(() => import("./components/auth/LoginPanel.vue"));
const AdminView = defineAsyncComponent(() => import("./views/AdminView.vue"));
const NotFoundView = defineAsyncComponent(() => import("./views/NotFoundView.vue"));

const { isProtected, isAuthPage } = useRouteGuard();

async function doLogout() {
  await logout();
  go("/beranda");
}

// Permintaan ke API baru dikirim setelah halaman selesai dimuat agar tidak
// menjadi rantai permintaan kritis yang menunda tampilan awal.
function afterPageLoad(task) {
  const run = () => setTimeout(task, 0);
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

onMounted(() => {
  afterPageLoad(() => {
    loadSpots();
    restoreSession();
  });
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

    <NotFoundView v-else-if="route.name === 'notfound'" />
  </main>

  <Footer />
  <ApiAlert />
</template>