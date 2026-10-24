<script setup>
import { onMounted } from "vue";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import SpotDetail from "./components/SpotDetail.vue";
import HomeView from "./views/HomeView.vue";
import SpotsView from "./views/SpotsView.vue";
import AdminView from "./views/AdminView.vue";
import { route, go, backPath } from "./composables/useRoute";
import { auth, restoreSession, logout } from "./composables/useAuth";
import { loadSpots, error } from "./composables/useSpots";

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
    <p v-if="error" class="error">{{ error }}</p>
    <SpotsView v-if="route.name === 'list' || route.name === 'map'" :mode="route.name" />
    <SpotDetail v-else-if="route.name === 'detail'" :spot-id="route.id" @close="go(backPath())" />
    <AdminView v-else-if="route.name === 'admin'" />
  </main>

  <Footer />
</template>
