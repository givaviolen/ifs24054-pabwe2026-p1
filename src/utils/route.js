export function parseRoute(pathname = window.location.pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";

  if (clean === "/" || clean === "/beranda") return { name: "home" };
  if (clean === "/daftar") return { name: "list" };
  if (clean === "/peta") return { name: "map" };

  const spotMatch = clean.match(/^\/pantai\/(\d+)$/);
  if (spotMatch) return { name: "detail", id: Number(spotMatch[1]) };

  if (clean === "/auth/login") return { name: "login" };
  if (clean === "/auth/register") return { name: "register" };

  if (clean === "/petugas") return { name: "admin" };
  if (clean === "/petugas/pantai") return { name: "admin-spots" };
  
  // Tangani bila dibuka /petugas/pantai/2
  const adminSpotMatch = clean.match(/^\/petugas\/pantai\/(\d+)$/);
  if (adminSpotMatch) return { name: "admin-spots", editId: Number(adminSpotMatch[1]) };

  if (clean === "/petugas/pantai/tambah") return { name: "admin-spot-new" };
  if (clean === "/petugas/kondisi") return { name: "admin-log" };

  return { name: "notfound" };
}