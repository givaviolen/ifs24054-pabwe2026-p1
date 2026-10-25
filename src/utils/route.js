/**
 * Daftar nama rute yang membutuhkan login (terproteksi)
 */
export const PROTECTED = ["admin", "admin-spots", "admin-spot-new", "admin-log"];
// Kompatibilitas jika dipanggil dengan .has() atau .includes()
PROTECTED.has = function (item) {
  return this.includes(item);
};

/**
 * Daftar nama rute otentikasi
 */
export const AUTH_PAGES = ["login", "register"];
AUTH_PAGES.has = function (item) {
  return this.includes(item);
};

/**
 * Mengubah URL hash (misal #/daftar) menjadi path standar (/daftar)
 */
export function hashToPath(hash = window.location.hash) {
  if (!hash || hash === "#" || hash === "#/") return "/beranda";
  return hash.replace(/^#/, "");
}

/**
 * Parsing path string menjadi objek route
 * Menangani rute publik, detail pantai, rute petugas, serta rute dinamis seperti /petugas/pantai/2
 */
export function parsePath(pathname = window.location.pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";

  // Halaman publik utama
  if (clean === "/" || clean === "/beranda") return { name: "home" };
  if (clean === "/daftar") return { name: "list" };
  if (clean === "/peta") return { name: "map" };

  // Detail pantai: /pantai/1, /pantai/2, dst
  const spotMatch = clean.match(/^\/pantai\/(\d+)$/);
  if (spotMatch) {
    return { name: "detail", id: Number(spotMatch[1]) };
  }

  // Autentikasi
  if (clean === "/auth/login") return { name: "login" };
  if (clean === "/auth/register") return { name: "register" };

  // Area petugas
  if (clean === "/petugas") return { name: "admin" };
  if (clean === "/petugas/pantai") return { name: "admin-spots" };

  // Menangani rute jika crawler atau pengguna mengakses /petugas/pantai/:id (misal /petugas/pantai/2)
  const adminSpotMatch = clean.match(/^\/petugas\/pantai\/(\d+)$/);
  if (adminSpotMatch) {
    return { name: "admin-spots", editId: Number(adminSpotMatch[1]) };
  }

  if (clean === "/petugas/pantai/tambah") return { name: "admin-spot-new" };
  if (clean === "/petugas/kondisi") return { name: "admin-log" };

  // Fallback halaman tidak ditemukan
  return { name: "notfound" };
}

// Alias untuk kompatibilitas
export const parseRoute = parsePath;