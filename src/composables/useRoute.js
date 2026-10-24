import { reactive } from "vue";
import { parsePath, hashToPath } from "../utils/route";

// Router sederhana berbasis History API (/daftar, /peta, /petugas/pantai, ...).
// Tombol Back/Forward dan refresh halaman tetap bekerja.
export const route = reactive({ name: "home", id: null, query: {} });

let lastBrowse = "/daftar"; // tujuan tombol "Kembali" di halaman detail

function sync() {
  const r = parsePath(window.location.pathname + window.location.search);
  route.name = r.name;
  route.id = r.id;
  route.query = r.query;
  if (r.name === "list") lastBrowse = "/daftar";
  if (r.name === "map") lastBrowse = "/peta";
  window.scrollTo(0, 0);
}

export function go(path, { replace = false } = {}) {
  const current = window.location.pathname + window.location.search;
  if (path !== current) window.history[replace ? "replaceState" : "pushState"](null, "", path);
  sync();
}
export const backPath = () => lastBrowse;

// Tautan lama "#/peta" dari bookmark dialihkan ke "/peta".
const legacy = hashToPath(window.location.hash);
if (legacy) window.history.replaceState(null, "", legacy);

// Semua <a href="/..."> (dan "#/...") berpindah halaman tanpa memuat ulang seluruh aplikasi.
document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.("a[href]");
  if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
  const raw = a.getAttribute("href");
  const path = raw.startsWith("#/") ? raw.slice(1) : raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
  if (!path) return;
  e.preventDefault();
  go(path);
});

window.addEventListener("popstate", sync);
sync();