/**
 * Daftar nama rute yang membutuhkan login (terproteksi)
 */
export const PROTECTED = ["admin", "admin-spots", "admin-spot-new", "admin-log"];
PROTECTED.has = function (item) {
  return this.includes(item);
};

/**
 * Daftar nama rute otentikasi
 */
export const AUTH_PAGES = ["login", "register"];
export const AUTH = AUTH_PAGES;
AUTH_PAGES.has = function (item) {
  return this.includes(item);
};

/**
 * Mengubah URL hash (misal #/daftar) menjadi path standar (/daftar)
 * PENTING: Jika hash kosong, kembalikan string kosong "" agar TIDAK menimpa window.location.pathname!
 */
export function hashToPath(hash = window.location.hash) {
  if (!hash || hash === "#" || hash === "#/") return "";
  return hash.replace(/^#/, "");
}

/**
 * Parsing path string menjadi objek route
 */
export function parsePath(pathname = window.location.pathname) {
  // Ambil path murni tanpa query string dan trailing slash
  const pathOnly = (pathname || "/").split("?")[0].split("#")[0];
  const clean = pathOnly.replace(/\/+$/, "") || "/";

  // Halaman publik utama
  if (clean === "/" || clean === "/beranda") return { name: "home" };
  if (clean === "/daftar") return { name: "list" };
  if (clean === "/peta") return { name: "map" };

  // Detail pantai: /pantai/:id
  const spotMatch = clean.match(/^\/pantai\/(\d+)$/);
  if (spotMatch) {
    return { name: "detail", id: Number(spotMatch[1]) };
  }

  // Halaman autentikasi
  if (clean === "/auth/login") return { name: "login" };
  if (clean === "/auth/register") return { name: "register" };

  // Area petugas (Authenticated)
  if (clean === "/petugas") return { name: "admin" };
  if (clean === "/petugas/pantai") return { name: "admin-spots" };

  // Menangani rute dinamis jika crawler mengakses /petugas/pantai/:id (misal /petugas/pantai/2)
  const adminSpotMatch = clean.match(/^\/petugas\/pantai\/(\d+)$/);
  if (adminSpotMatch) {
    return { name: "admin-spots", editId: Number(adminSpotMatch[1]) };
  }

  if (clean === "/petugas/pantai/tambah") return { name: "admin-spot-new" };
  if (clean === "/petugas/kondisi") return { name: "admin-log" };

  // Fallback
  return { name: "notfound" };
}

// Alias untuk fleksibilitas import
export const parseRoute = parsePath;