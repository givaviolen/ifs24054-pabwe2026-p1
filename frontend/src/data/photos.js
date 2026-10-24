// Foto dari Wikimedia Commons. Setiap foto ditautkan ke halaman filenya agar
// pembuat dan lisensinya dapat dilihat.
//
// Mengganti foto: ubah nama file di bawah, atau simpan foto sendiri di
// frontend/public/photos/ lalu isi `src` dengan "/photos/nama-file.jpg".
const commons = (file, width) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
const page = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`;

const make = (file, caption, alt) => ({
  file, caption, alt, src: commons(file, 1400), href: page(file),
});

export const PHOTOS = [
  make("Lake_Toba_Aerial_View.JPG", "Danau Toba dilihat dari udara", "Pemandangan udara Danau Toba"),
  make("Lake_Toba_and_the_surrounding_hills.jpg", "Danau Toba dan perbukitan di sekelilingnya", "Danau Toba dengan perbukitan di sekitarnya"),
  make("Danau_Toba_-_Sumut.jpg", "Danau Toba, Sumut", "Danau Toba di Sumatera Utara"),
  make("Lake_Toba,_North_Sumatra_(71).JPG", "Danau Toba, Sumatera Utara", "Danau Toba di Sumatera Utara"),
];
