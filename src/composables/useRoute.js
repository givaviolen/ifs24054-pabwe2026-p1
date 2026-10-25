import { reactive } from "vue";
import { parsePath, hashToPath } from "../utils/route";

export const route = reactive({ name: "home", id: null, query: {} });
let lastBrowse = "/daftar"; // tujuan tombol "Kembali" di halaman detail

function sync() {
  const r = parsePath(globalThis.location.pathname + globalThis.location.search);
  route.name = r.name;
  route.id = r.id;
  route.query = r.query;
  if (r.name === "list") lastBrowse = "/daftar";
  if (r.name === "map") lastBrowse = "/peta";
  globalThis.scrollTo(0, 0);
}

export function go(path, { replace = false } = {}) {
  const current = globalThis.location.pathname + globalThis.location.search;
  if (path !== current) {
    globalThis.history[replace ? "replaceState" : "pushState"](null, "", path);
  }
  sync();
}

export const backPath = () => lastBrowse;

if (typeof globalThis.window === "object" && globalThis.window !== null) {
  // Tautan lama "#/peta" dari bookmark dialihkan ke "/peta".
  const legacy = hashToPath(globalThis.location.hash);
  if (legacy) {
    globalThis.history.replaceState(null, "", legacy);
  }

  // Semua <a href="/..."> (dan "#/...") berpindah halaman tanpa memuat ulang seluruh aplikasi.
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;

    const raw = a.getAttribute("href");
    if (!raw) return;

    let path = null;
    if (raw.startsWith("#/")) {
      path = raw.slice(1);
    } else if (raw.startsWith("/") && !raw.startsWith("//")) {
      path = raw;
    }

    if (!path) return;
    e.preventDefault();
    go(path);
  });

  globalThis.addEventListener("popstate", sync);
  sync();
}