<script setup>
import { apiError, dismissApiError, loadSpots, loading } from "../../composables/useSpots";
</script>

<template>
  <Transition name="slide">
    <div v-if="apiError" class="alert" role="alert">
      <div class="txt">
        <strong>⚠️ {{ apiError.message }}</strong>
        <small v-if="apiError.hint">{{ apiError.hint }}</small>
      </div>
      <div class="btns">
        <button type="button" :disabled="loading" @click="loadSpots">{{ loading ? "Mencoba…" : "Coba lagi" }}</button>
        <button type="button" class="x" aria-label="Tutup pesan" @click="dismissApiError">✕</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.alert {
  position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); z-index: 2000;
  width: min(640px, calc(100% - 24px)); display: flex; gap: 14px; align-items: center; justify-content: space-between;
  background: #8c2b2b; color: #fff; padding: 12px 16px; border-radius: 14px;
  box-shadow: 0 12px 34px rgba(0, 0, 0, .45); border: 1px solid rgba(255, 255, 255, .25);
}
.txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.txt small { opacity: .88; line-height: 1.45; word-break: break-word; }
.btns { display: flex; gap: 8px; flex: none; align-items: center; }
.btns button { background: #fff; color: #8c2b2b; font-weight: 700; padding: 7px 14px; min-width: 108px; }
.btns .x { background: transparent; color: #fff; padding: 6px 8px; min-width: 0; }
.slide-enter-active, .slide-leave-active { transition: opacity .2s, transform .2s; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translate(-50%, 12px); }
</style>
