// Fungsi murni untuk format waktu (mudah diuji).
const WIB = "Asia/Jakarta";

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
    timeZone: WIB, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
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

const wibDay = (d) => d.toLocaleDateString("en-CA", { timeZone: WIB });

// Apakah tanggal SQL itu jatuh pada hari yang sama (zona WIB) dengan `now`?
export function isSameWibDay(value, now = new Date()) {
  const d = parseSqlDate(value);
  return Boolean(d) && wibDay(d) === wibDay(now);
}
