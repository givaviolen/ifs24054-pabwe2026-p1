import { API_URL, API_URL_MISSING } from "../config/env";

// Mengubah error axios menjadi pesan yang ramah dibaca + petunjuk perbaikan.
export function describeError(error, fallback = "Terjadi kesalahan.") {
  if (error?.response) {
    const message = error.response.data?.error;
    if (message) return { kind: "http", message, hint: "" };
    return { kind: "http", message: `Server membalas dengan kode ${error.response.status}.`, hint: `Alamat API: ${API_URL}` };
  }
  if (error?.code === "ECONNABORTED") {
    return {
      kind: "timeout",
      message: "Server API terlalu lama merespons.",
      hint: "Server gratis dapat butuh beberapa detik untuk bangun. Coba lagi sebentar.",
    };
  }
  if (error?.request || error?.message === "Network Error") {
    return {
      kind: "network",
      message: "Tidak dapat terhubung ke server API.",
      hint: API_URL_MISSING
        ? "VITE_API_URL belum diatur pada build ini. Isi di Environment Variables Vercel (Front-End), lalu redeploy."
        : `Pastikan Back-End berjalan di ${API_URL} dan CORS mengizinkan situs ini.`,
    };
  }
  return { kind: "unknown", message: fallback, hint: "" };
}
