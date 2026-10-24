// Foto per pantai. Simpan file di folder public/photos/ lalu tulis di sini.
// Kuncinya HARUS sama persis dengan kolom nama_pantai di database.
// Pantai yang tidak terdaftar (atau fotonya tidak ditemukan) tetap tampil normal tanpa foto.
// Gunakan hanya foto pantai yang bersangkutan, milik sendiri atau berlisensi bebas dengan atribusi.
export const SPOT_PHOTOS = {
  "Pantai Pasir Putih Parbaba": "/photos/parbaba.jpg",
  "Pantai Lumban Silintong": "/photos/lumban-silintong.jpg",
  // "Nama Pantai Persis Seperti di Database": "/photos/nama-file.jpg",
};

export const spotPhoto = (spot) => SPOT_PHOTOS[spot.nama_pantai] || null;