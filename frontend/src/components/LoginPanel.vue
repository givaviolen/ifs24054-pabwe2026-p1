<script setup>
import { reactive, ref } from "vue";
import { login, register } from "../composables/useAuth";

const mode = ref("login"); // login | register
const form = reactive({ username: "", nama: "", password: "", kode_petugas: "" });
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = ""; loading.value = true;
  try {
    if (mode.value === "login") await login(form.username, form.password);
    else await register({ ...form });
  } catch (e) {
    error.value = e.response?.data?.error || "Tidak dapat terhubung ke server.";
  } finally { loading.value = false; }
}
</script>

<template>
  <section class="card box">
    <h2>{{ mode === "login" ? "Login Petugas" : "Registrasi Petugas" }}</h2>
    <p class="muted">Halaman ini khusus petugas lapangan / pengelola pesisir. Wisatawan dapat melihat informasi tanpa akun.</p>

    <div class="tabs">
      <button type="button" :class="mode === 'login' ? '' : 'ghost'" @click="mode = 'login'; error = ''">Login</button>
      <button type="button" :class="mode === 'register' ? '' : 'ghost'" @click="mode = 'register'; error = ''">Registrasi</button>
    </div>

    <form @submit.prevent="submit">
      <label>Username
        <input v-model="form.username" autocomplete="username" required />
      </label>
      <label v-if="mode === 'register'">Nama lengkap
        <input v-model="form.nama" autocomplete="name" required />
      </label>
      <label>Password
        <input v-model="form.password" type="password" minlength="6"
               :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" required />
      </label>
      <label v-if="mode === 'register'">Kode registrasi petugas
        <input v-model="form.kode_petugas" type="password" autocomplete="off" required />
        <small class="muted">Kode diberikan oleh pengelola. Tanpa kode, akun tidak dapat dibuat.</small>
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading">
        {{ loading ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar" }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.box { max-width: 420px; margin: 24px auto; }
.tabs { display: flex; gap: 8px; margin: 12px 0 16px; }
.tabs button { flex: 1; }
form > button { width: 100%; }
small { display: block; margin-top: 4px; }
</style>
