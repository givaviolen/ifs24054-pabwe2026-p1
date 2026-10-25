const WIB_TIMEZONE = "Asia/Jakarta";

/**
 * Parsing tanggal dari string format SQL (YYYY-MM-DD HH:MM:SS) atau ISO string
 */
export function parseSqlDate(str) {
  if (!str || typeof str !== "string") return null;

  // Tangani format SQL "YYYY-MM-DD HH:MM:SS" sebagai UTC
  const sqlMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (sqlMatch) {
    const [, y, m, d, h, min, s] = sqlMatch;
    return new Date(Date.UTC(+y, +m - 1, +d, +h, +min, +s));
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Menghasilkan teks waktu relatif (contoh: "5 menit lalu", "baru saja")
 */
export function timeAgo(dateInput) {
  if (!dateInput) return "-";

  const date = dateInput instanceof Date ? dateInput : parseSqlDate(dateInput);
  if (!date) return "-";

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "baru saja";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  return `${Math.floor(diffSec / 86400)} hari lalu`;
}

/**
 * Mengubah input ke tanggal kalender WIB (YYYY-MM-DD)
 */
function toWibDayString(input) {
  if (!input) return "";
  const d = input instanceof Date ? input : parseSqlDate(input);
  if (!d) return "";
  return d.toLocaleDateString("en-CA", { timeZone: WIB_TIMEZONE });
}

/**
 * Memeriksa apakah dua tanggal jatuh pada hari kalender yang sama di zona WIB
 */
export function isSameWibDay(dateA, dateB = new Date()) {
  const dayA = toWibDayString(dateA);
  const dayB = toWibDayString(dateB);
  if (!dayA || !dayB) return false;
  return dayA === dayB;
}

/**
 * Format tanggal ke standar WIB dengan akhiran "WIB"
 */
export function formatWib(dateInput) {
  if (!dateInput) return "-";

  const date = dateInput instanceof Date ? dateInput : parseSqlDate(dateInput);
  if (!date) return "-";

  const options = {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formatted = new Intl.DateTimeFormat("id-ID", options).format(date);
  return `${formatted.replace(/\./g, ":")} WIB`;
}