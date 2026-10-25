import { STATUS_META } from "../constants/status";

// Konstanta dan pembuat isi popup yang dipakai bersama peta Google dan peta OpenStreetMap.
const pickMeta = (key) => Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v[key]]));
export const COLORS = pickMeta("mapColor");
export const LABELS = pickMeta("label");
export const ZONE_RADIUS_M = 400; // lingkaran "radar" di sekitar titik pantai

// Isi popup dibuat dengan DOM + textContent (bukan innerHTML) agar aman dari XSS.
export function buildSpotInfo(spot, onDetail) {
  const root = document.createElement("div");
  root.style.cssText = "min-width:200px;font-family:system-ui,sans-serif;color:#17313e";

  const title = document.createElement("strong");
  title.textContent = spot.nama_pantai;

  const badge = document.createElement("div");
  badge.textContent = LABELS[spot.current_status] || spot.current_status;
  badge.style.cssText = `display:inline-block;margin:6px 0;padding:2px 10px;border-radius:999px;color:${spot.current_status === "WASPADA" ? "#17313e" : "#fff"};background:${COLORS[spot.current_status]};font-size:12px;font-weight:600`;

  const kab = document.createElement("div");
  kab.textContent = `Kabupaten ${spot.kabupaten}`;
  kab.style.cssText = "font-size:13px;margin-bottom:8px";

  const detail = document.createElement("button");
  detail.textContent = "Lihat detail";
  detail.style.cssText = "margin-right:8px;padding:5px 12px;border:0;border-radius:999px;background:#0b6e8f;color:#fff;cursor:pointer";
  detail.addEventListener("click", () => onDetail(spot.id));

  const link = document.createElement("a");
  link.textContent = "Buka di Google Maps";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.href = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
  link.style.cssText = "font-size:12px";

  root.append(title, document.createElement("br"), badge, kab, detail, link);
  return root;
}