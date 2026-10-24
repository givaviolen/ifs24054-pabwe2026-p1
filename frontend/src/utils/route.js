// Mengubah hash URL (mis. "#/pantai/5") menjadi nama halaman. Fungsi murni, mudah diuji.
export function parseHash(hash) {
  const path = String(hash || "").replace(/^#/, "").split("?")[0];
  const parts = path.split("/").filter(Boolean);
  const first = parts[0];

  if (!first || first === "beranda") return { name: "home" };
  if (first === "daftar") return { name: "list" };
  if (first === "peta") return { name: "map" };
  if (first === "petugas") return { name: "admin" };
  if (first === "pantai" && /^\d+$/.test(parts[1] || "")) {
    return { name: "detail", id: Number(parts[1]) };
  }
  return { name: "home" }; // alamat tidak dikenal -> beranda
}
