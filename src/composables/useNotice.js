import { ref, onBeforeUnmount } from "vue";

export function useNotice(durationMs = 5000) {
  const notice = ref(null);
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