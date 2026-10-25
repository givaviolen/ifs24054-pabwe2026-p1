<script setup>
import { onMounted } from "vue";
import Navbar from "./components/layout/Navbar.vue";
import Footer from "./components/layout/Footer.vue";
import ApiAlert from "./components/common/ApiAlert.vue";
import SpotDetail from "./components/spots/SpotDetail.vue";
import LoginPanel from "./components/auth/LoginPanel.vue";
import HomeView from "./views/HomeView.vue";
import SpotsView from "./views/SpotsView.vue";
import AdminView from "./views/AdminView.vue";
import NotFoundView from "./views/NotFoundView.vue";
import { route, go, backPath } from "./composables/useRoute";
import { auth, restoreSession, logout } from "./composables/useAuth";
import { useRouteGuard } from "./composables/useRouteGuard";
import { loadSpots } from "./composables/useSpots";

const { isProtected, isAuthPage } = useRouteGuard();

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

    <NotFoundView v-else-if="route.name === 'notfound'" />
  </main>

  <Footer />
  <ApiAlert />
</template>
