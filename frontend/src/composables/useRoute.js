import { reactive } from "vue";
import { parseHash } from "../utils/route";

// Router sederhana berbasis hash (#/daftar, #/peta, ...). Halaman tetap sama setelah refresh
// karena posisi tersimpan di URL, dan tombol Back/Forward browser ikut bekerja.
export const route = reactive({ name: "home", id: null });

let lastBrowse = "/daftar"; // tujuan tombol "Kembali" di halaman detail

function sync() {
  const r = parseHash(window.location.hash);
  route.name = r.name;
  route.id = r.id ?? null;
  if (r.name === "list") lastBrowse = "/daftar";
  if (r.name === "map") lastBrowse = "/peta";
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", sync);
sync();

export const go = (path) => { window.location.hash = path; };
export const backPath = () => lastBrowse;
