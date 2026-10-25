import { ref, onBeforeUnmount } from "vue";

// Pesan singkat (sukses/gagal) yang hilang sendiri. Panggil di dalam setup().
export function useNotice(durationMs = 5000) {
  const notice = ref(null); // { type: "ok" | "err", text }
  let timer;

  function notify(type, text) {
    notice.value = { type, text };
    clearTimeout(timer);
    timer = setTimeout(() => {
      notice.value = null;
    }, durationMs);
  }

  onBeforeUnmount(() => clearTimeout(timer));

  return { notice, notify };
}