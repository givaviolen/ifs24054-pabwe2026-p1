import { watch, computed } from "vue";
import { route, go } from "./useRoute";
import { auth } from "./useAuth";
import { PROTECTED } from "../utils/route";

// Penjaga halaman: belum login -> /auth/login, sudah login -> tidak perlu halaman login lagi.
export function useRouteGuard() {
  const isProtected = computed(() => PROTECTED.has(route.name));
  const isAuthPage = computed(() => route.name === "login" || route.name === "register");

  watch(
    [() => route.name, () => auth.ready, () => auth.user],
    () => {
      if (!auth.ready) return;
      if (isProtected.value && !auth.user) go("/auth/login", { replace: true });
      else if (isAuthPage.value && auth.user) go("/petugas", { replace: true });
    },
    { immediate: true }
  );

  return { isProtected, isAuthPage };
}
