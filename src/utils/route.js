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
 * Mengubah URL hash menjadi path:
 * #/peta -> /peta
 * #bagian atau "" -> null
 */
export function hashToPath(hash = (typeof globalThis.window === "undefined" ? "" : globalThis.location.hash)) {
  if (!hash || typeof hash !== "string") return null;
  if (!hash.startsWith("#/")) return null;
  return hash.slice(1);
}

/**
 * Parsing path string menjadi objek route beserta query parameter
 */
export function parsePath(pathname = (typeof globalThis.window === "undefined" ? "/" : globalThis.location.pathname)) {
  if (!pathname) return { name: "notfound", query: {} };

  const [pathOnly, queryPart] = pathname.split("?");
  let cleanPath = pathOnly;
  while (cleanPath.endsWith("/")) {
    cleanPath = cleanPath.slice(0, -1);
  }
  const clean = cleanPath || "/";

  // Parsing query parameter
  const query = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    searchParams.forEach((val, key) => {
      query[key] = val;
    });
  }

  // Halaman publik utama
  if (clean === "/" || clean === "/beranda") return { name: "home", query };
  if (clean === "/daftar") return { name: "list", query };
  if (clean === "/peta") return { name: "map", query };

  // Detail pantai: /pantai/:id
  const spotRegex = /^\/pantai\/(\d+)$/;
  const spotMatch = spotRegex.exec(clean);
  if (spotMatch) {
    return { name: "detail", id: Number(spotMatch[1]), query };
  }

  // Halaman autentikasi
  if (clean === "/auth/login") return { name: "login", query };
  if (clean === "/auth/register") return { name: "register", query };

  // Area petugas
  if (clean === "/petugas") return { name: "admin", query };
  if (clean === "/petugas/pantai") return { name: "admin-spots", query };

  // Menangani rute dinamis /petugas/pantai/:id
  const adminSpotRegex = /^\/petugas\/pantai\/(\d+)$/;
  const adminSpotMatch = adminSpotRegex.exec(clean);
  if (adminSpotMatch) {
    return { name: "admin-spots", editId: Number(adminSpotMatch[1]), query };
  }

  if (clean === "/petugas/pantai/tambah") return { name: "admin-spot-new", query };
  if (clean === "/petugas/kondisi") return { name: "admin-log", query };

  // Fallback
  return { name: "notfound", query };
}

export const parseRoute = parsePath;