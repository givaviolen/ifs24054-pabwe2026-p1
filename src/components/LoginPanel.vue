<script setup>
import { reactive, ref, computed, watch } from "vue";
import { login, register } from "../composables/useAuth";
import { describeError } from "../services/api";
import { go } from "../composables/useRoute";

const props = defineProps({ mode: { type: String, default: "login" } }); // login | register
const isLogin = computed(() => props.mode !== "register");

const form = reactive({ username: "", nama: "", password: "", kode_petugas: "" });
const error = ref("");
const hint = ref("");
const loading = ref(false);

// Berpindah antara login dan registrasi: bersihkan pesan error dan isian rahasia.
watch(() => props.mode, () => {
  error.value = ""; hint.value = "";
  form.password = ""; form.kode_petugas = "";
});

async function submit() {
  error.value = ""; hint.value = ""; loading.value = true;
  try {
    if (isLogin.value) await login(form.username, form.password);
    else await register({ ...form });
    go("/petugas");
  } catch (e) {
    const d = describeError(e, "Gagal memproses permintaan.");
    error.value = d.message; hint.value = d.hint;
  } finally { loading.value = false; }
}
</script>

<template>
  <section class="auth">
    <div class="panel">
      <div class="icon" aria-hidden="true">🌊</div>
      <h2>{{ isLogin ? "Masuk sebagai Petugas" : "Daftar Akun Petugas" }}</h2>
      <p class="sub">
        {{ isLogin
          ? "Masuk untuk memperbarui kondisi pantai dan mengelola data pesisir."
          : "Buat akun petugas dengan kode registrasi dari pengelola." }}
      </p>

      <form @submit.prevent="submit">
        <label>Username
          <input v-model="form.username" autocomplete="username" required />
        </label>
        <label v-if="!isLogin">Nama lengkap
          <input v-model="form.nama" autocomplete="name" required />
        </label>
        <label>Password
          <input v-model="form.password" type="password" minlength="6"
                 :autocomplete="isLogin ? 'current-password' : 'new-password'" required />
        </label>
        <label v-if="!isLogin">Kode registrasi petugas
          <input v-model="form.kode_petugas" type="password" autocomplete="off" required />
          <small>Kode diberikan oleh pengelola.</small>
        </label>

        <p v-if="error" class="err" role="alert">
          {{ error }}<small v-if="hint"><br />{{ hint }}</small>
        </p>

        <button type="submit" class="submit" :disabled="loading">
          {{ loading ? "Memproses…" : isLogin ? "Masuk" : "Daftar" }}
        </button>
      </form>

      <p class="switch">
        <template v-if="isLogin">
          Belum punya akun? <a class="link" href="/auth/register">Daftar</a>
        </template>
        <template v-else>
          Sudah punya akun? <a class="link" href="/auth/login">Login</a>
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth { display: grid; place-items: center; padding: 48px 16px 24px; }
.panel {
  width: min(440px, 100%); padding: 34px 30px 26px; border-radius: 22px;
  background: linear-gradient(160deg, rgba(11, 90, 110, .50), rgba(5, 42, 61, .86));
  border: 1px solid var(--line); backdrop-filter: blur(10px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, .40);
}
.icon {
  width: 52px; height: 52px; display: grid; place-items: center; font-size: 1.6rem; margin-bottom: 14px;
  border-radius: 16px; background: rgba(92, 225, 200, .14); border: 1px solid rgba(92, 225, 200, .35);
}
h2 { font-size: 1.55rem; color: #fff; }
.sub { margin: 0 0 22px; color: var(--muted); font-size: .92rem; line-height: 1.55; }

label { display: block; margin-bottom: 14px; font-size: .82rem; font-weight: 600; color: var(--text); }
label input {
  display: block; width: 100%; margin-top: 6px; padding: 11px 14px; font: inherit; font-weight: 400;
  color: var(--text); background: rgba(3, 26, 38, .65); border: 1px solid var(--line); border-radius: 12px;
}
label input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(92, 225, 200, .22); }
small { display: block; margin-top: 5px; font-weight: 400; color: var(--muted); }

.err { margin: 0 0 14px; padding: 10px 12px; border-radius: 10px; font-size: .86rem;
  background: rgba(211, 58, 58, .18); border: 1px solid rgba(211, 58, 58, .5); color: #ffc5c5; }

.submit { width: 100%; padding: 12px; font-weight: 700; border-radius: 999px; background: var(--amber); color: #1b2a30; }

.switch { margin: 18px 0 0; text-align: center; font-size: .88rem; color: var(--muted); }
.link { margin-left: 4px; font-weight: 700; color: var(--accent); text-decoration: none; }
.link:hover { text-decoration: underline; }
</style>