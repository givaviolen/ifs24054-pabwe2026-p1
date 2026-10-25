// Transformasi dan validasi form pantai dipusatkan agar aturan konsisten.
const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export function validateSpotForm(form) {
  const errors = {};

  if (!String(form.nama_pantai ?? "").trim()) {
    errors.nama_pantai = "Nama pantai wajib diisi.";
  } else if (String(form.nama_pantai).trim().length > 100) {
    errors.nama_pantai = "Nama pantai maksimal 100 karakter.";
  }

  if (!String(form.kabupaten ?? "").trim()) {
    errors.kabupaten = "Kabupaten wajib diisi.";
  } else if (String(form.kabupaten).trim().length > 60) {
    errors.kabupaten = "Kabupaten maksimal 60 karakter.";
  }

  const depth = toNumberOrNull(form.kedalaman_avg);
  if (form.kedalaman_avg !== "" && (depth === null || depth < 0)) {
    errors.kedalaman_avg = "Kedalaman harus berupa angka nol atau lebih.";
  }

  const latitude = toNumberOrNull(form.latitude);
  const longitude = toNumberOrNull(form.longitude);
  if (form.latitude !== "" && (latitude === null || latitude < -90 || latitude > 90)) {
    errors.latitude = "Latitude harus berada di antara -90 dan 90.";
  }
  if (form.longitude !== "" && (longitude === null || longitude < -180 || longitude > 180)) {
    errors.longitude = "Longitude harus berada di antara -180 dan 180.";
  }
  if ((form.latitude === "") !== (form.longitude === "")) {
    errors.coordinates = "Isi latitude dan longitude sekaligus, atau kosongkan keduanya.";
  }

  return errors;
}

export const toSpotPayload = (form) => ({
  nama_pantai: String(form.nama_pantai ?? "").trim(),
  kabupaten: String(form.kabupaten ?? "").trim(),
  kedalaman_avg: toNumberOrNull(form.kedalaman_avg),
  is_ramah_anak: form.is_ramah_anak ? 1 : 0,
  ada_pelampung: form.ada_pelampung ? 1 : 0,
  current_status: form.current_status,
  latitude: toNumberOrNull(form.latitude),
  longitude: toNumberOrNull(form.longitude),
});
