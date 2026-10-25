// Isi kolom edukasi di Beranda. `patch` = filter yang diterapkan, `path` = halaman tujuan.
export const EDUCATION_ITEMS = [
  { tag: "Eceng gondok", title: "Kenali eceng gondok yang berpindah", text: "Angin dapat menggeser eceng gondok ke bibir pantai dalam hitungan jam. Status hijau berarti perairannya bersih dari sebaran pekat.", action: "Lihat pantai aman", patch: { status: "AMAN" }, path: "/daftar" },
  { tag: "Kedalaman", title: "Waspadai dasar yang curam", text: "Sebagian pesisir turun mendadak. Untuk keluarga dengan anak, pilih pantai berkontur landai dan tetap dampingi anak.", action: "Pantai ramah anak", patch: { ramah_anak: true }, path: "/daftar" },
  { tag: "Cuaca & ombak", title: "Pantau ombak sebelum berangkat", text: "Angin kencang membuat ombak naik. Cek catatan terbaru petugas dan peta status sebelum turun ke air.", action: "Buka peta status", patch: {}, path: "/peta" },
  { tag: "Perlengkapan", title: "Gunakan pelampung", text: "Pelampung mengurangi risiko, terutama bagi yang belum mahir berenang. Pilih pantai yang menyediakan sewa atau pos pelampung.", action: "Pantai berpelampung", patch: { ada_pelampung: true }, path: "/daftar" },
];
