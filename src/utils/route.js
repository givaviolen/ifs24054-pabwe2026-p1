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
export function hashToPath(hash = (globalThis.location ? globalThis.location.hash : "")) {
  if (!hash || typeof hash !== "string") return null;
  if (!hash.startsWith("#/")) return null;
  return hash.slice(1);
}

// Rute statis: path -> nama rute.
const STATIC_ROUTES = {
  "/": "home",
  "/beranda": "home",
  "/daftar": "list",
  "/peta": "map",
  "/auth/login": "login",
  "/auth/register": "register",
  "/petugas": "admin",
  "/petugas/pantai": "admin-spots",
  "/petugas/pantai/tambah": "admin-spot-new",
  "/petugas/kondisi": "admin-log",
};

// Rute dinamis: pola path -> pembuat objek rute (tanpa query).
const DYNAMIC_ROUTES = [
  { pattern: /^\/pantai\/(\d+)$/, build: (id) => ({ name: "detail", id }) },
  { pattern: /^\/petugas\/pantai\/(\d+)$/, build: (id) => ({ name: "admin-spots", editId: id }) },
];

// Menghapus garis miring di akhir path (kecuali karakter pertama).
function stripTrailingSlashes(path) {
  let end = path.length;
  while (end > 1 && path[end - 1] === "/") end--;
  return path.slice(0, end) || "/";
}

function parseQuery(queryPart) {
  const query = {};
  if (!queryPart) return query;
  for (const [key, val] of new URLSearchParams(queryPart)) {
    query[key] = val;
  }
  return query;
}

function matchRoute(clean) {
  const staticName = STATIC_ROUTES[clean];
  if (staticName) return { name: staticName };

  for (const { pattern, build } of DYNAMIC_ROUTES) {
    const match = pattern.exec(clean);
    if (match) return build(Number(match[1]));
  }
  return { name: "notfound" };
}

/**
 * Parsing path string menjadi objek route beserta query parameter
 */
export function parsePath(pathname = (globalThis.location ? globalThis.location.pathname : "/")) {
  if (!pathname) return { name: "notfound", query: {} };

  const [pathOnly, queryPart] = pathname.split("?");
  const clean = stripTrailingSlashes(pathOnly);

  return { ...matchRoute(clean), query: parseQuery(queryPart) };
}

export const parseRoute = parsePath;