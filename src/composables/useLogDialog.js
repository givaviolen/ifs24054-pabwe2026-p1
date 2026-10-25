import { ref, watch } from "vue";
import { route, go } from "./useRoute";
import { allSpots } from "./useSpots";

const LOG_PATH = "/petugas/kondisi";

// Mengatur dialog "Catat Kondisi". Alamat /petugas/kondisi?spot=5 langsung membuka dialog untuk pantai itu.
export function useLogDialog(page) {
  const visible = ref(false);
  const spotId = ref(null);

  const clearSpotQuery = () => { if (route.query.spot) go(LOG_PATH, { replace: true }); };

  function open(id = null) {
    spotId.value = id;
    visible.value = true;
  }
  function close() {
    visible.value = false;
    clearSpotQuery();
  }
  function afterSaved() {
    visible.value = false;
    clearSpotQuery();
  }

  watch(
    () => [page(), route.query.spot, allSpots.value.length],
    () => {
      if (page() === "admin-log" && route.query.spot && allSpots.value.length && !visible.value) {
        open(Number(route.query.spot));
      }
    },
    { immediate: true }
  );

  return { visible, spotId, open, close, afterSaved };
}
