// Mengubah isian formulir pantai menjadi payload API.
const toNumberOrNull = (v) => (v === "" || v === null ? null : Number(v));

export const toSpotPayload = (form) => ({
  ...form,
  kedalaman_avg: toNumberOrNull(form.kedalaman_avg),
  latitude: toNumberOrNull(form.latitude),
  longitude: toNumberOrNull(form.longitude),
  is_ramah_anak: form.is_ramah_anak ? 1 : 0,
  ada_pelampung: form.ada_pelampung ? 1 : 0,
});
