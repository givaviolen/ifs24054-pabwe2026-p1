// Halaman yang hanya boleh dibuka petugas yang sudah login.
export const PROTECTED = new Set(["admin", "admin-spots", "admin-spot-new", "admin-log"]);

// Mengubah alamat URL (mis. "/pantai/5?x=1") menjadi nama halaman. Fungsi murni, mudah diuji.
export function parsePath(input) {
  const [pathPart, queryPart = ""] = String(input || "/").split("#")[0].split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(queryPart));
  const [a, b, c] = parts;
  const out = (name, extra = {}) => ({ name, id: null, query, ...extra });

  if (!a || a === "beranda") return out("home");
  if (a === "daftar" && !b) return out("list");
  if (a === "peta" && !b) return out("map");
  if (a === "pantai" && /^\d+$/.test(b || "") && !c) return out("detail", { id: Number(b) });
  if (a === "auth" && b === "login" && !c) return out("login");
  if (a === "auth" && b === "register" && !c) return out("register");
  if (a === "petugas") {
    if (!b) return out("admin");
    if (b === "pantai" && !c) return out("admin-spots");
    if (b === "pantai" && c === "tambah" && parts.length === 3) return out("admin-spot-new");
    if (b === "kondisi" && !c) return out("admin-log");
  }
  return out("notfound");
}

// Alamat lama berbentuk "#/peta" diubah menjadi "/peta".
export function hashToPath(hash) {
  return String(hash || "").startsWith("#/") ? String(hash).slice(1) : null;
}