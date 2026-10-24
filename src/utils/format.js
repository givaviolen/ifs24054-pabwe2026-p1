// Fungsi murni untuk format waktu & aturan status (mudah diuji).

// SQLite CURRENT_TIMESTAMP menghasilkan "YYYY-MM-DD HH:MM:SS" dalam UTC.
export function parseSqlDate(value) {
  if (!value) return null;
  const s = String(value);
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s.replace(" ", "T") : s.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatWib(value) {
  const d = parseSqlDate(value);
  if (!d) return "-";
  const text = d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  return `${text} WIB`;
}

export function timeAgo(value, now = Date.now()) {
  const d = parseSqlDate(value);
  if (!d) return "";
  const sec = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (sec < 60) return "baru saja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  return `${Math.floor(hr / 24)} hari lalu`;
}

// Sama dengan aturan di Back-End (deriveStatus pada app.js), dipakai untuk pratinjau di formulir.
export function deriveStatus(eceng, ombak) {
  if (eceng === "Pekat" || ombak === "Tinggi") return "BAHAYA";
  if (eceng === "Sedang" || ombak === "Sedang") return "WASPADA";
  return "AMAN";
}

export const STATUS_INFO = {
  AMAN: {
    label: "Aman Berenang", icon: "🟢",
    advice: "Air jernih, bebas eceng gondok pekat, dan ombak tenang. Tetap dampingi anak-anak saat berenang.",
  },
  WASPADA: {
    label: "Waspada", icon: "🟡",
    advice: "Ada sebaran eceng gondok atau ombak sedang. Berenang di area yang dijaga dan ikuti arahan petugas.",
  },
  BAHAYA: {
    label: "Bahaya / Tutup", icon: "🔴",
    advice: "Kondisi berbahaya atau pantai ditutup sementara. Tunda berenang sampai petugas memperbarui status.",
  },
};
