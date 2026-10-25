// Satu-satunya sumber data status kelayakan berenang (label, ikon, warna, saran).
// Aturan penentuan status otomatis ada di utils/status.js.
export const STATUS_META = {
  AMAN: {
    label: "Aman Berenang", icon: "🟢", cardIcon: "🏊", cssVar: "var(--aman)", mapColor: "#1f9d55", order: 0,
    advice: "Air jernih, bebas eceng gondok pekat, dan ombak tenang. Tetap dampingi anak-anak saat berenang.",
  },
  WASPADA: {
    label: "Waspada", icon: "🟡", cardIcon: "⚠️", cssVar: "var(--waspada)", mapColor: "#f2b705", order: 1,
    advice: "Ada sebaran eceng gondok atau ombak sedang. Berenang di area yang dijaga dan ikuti arahan petugas.",
  },
  BAHAYA: {
    label: "Bahaya / Tutup", icon: "🔴", cardIcon: "⛔", cssVar: "var(--bahaya)", mapColor: "#d33a3a", order: 2,
    advice: "Kondisi berbahaya atau pantai ditutup sementara. Tunda berenang sampai petugas memperbarui status.",
  },
};

export const STATUS_KEYS = Object.keys(STATUS_META);

// Status yang tidak dikenal diperlakukan sebagai AMAN agar tampilan tidak rusak.
export const statusMeta = (status) => STATUS_META[status] ?? STATUS_META.AMAN;

// Pilihan log harian (harus sama dengan validasi di Back-End).
export const ECENG_LEVELS = ["Bersih", "Sedang", "Pekat"];
export const OMBAK_LEVELS = ["Tenang", "Sedang", "Tinggi"];
