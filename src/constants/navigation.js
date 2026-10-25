// Menu utama dan tab panel petugas. Nama (name) sama dengan hasil parsePath di utils/route.js.
export const NAV_LINKS = [
  { name: "home", href: "/beranda", label: "Beranda" },
  { name: "list", href: "/daftar", label: "Daftar" },
  { name: "map", href: "/peta", label: "Peta" },
];

export const ADMIN_TABS = [
  { name: "admin", href: "/petugas", label: "Ringkasan" },
  { name: "admin-spots", href: "/petugas/pantai", label: "Kelola Pantai" },
  { name: "admin-spot-new", href: "/petugas/pantai/tambah", label: "Tambah Pantai" },
  { name: "admin-log", href: "/petugas/kondisi", label: "Catat Kondisi" },
];
