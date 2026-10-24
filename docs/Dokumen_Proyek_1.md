# DOKUMEN PROYEK 1
## Mata Kuliah Pengembangan Aplikasi Berbasis Web

| | |
|---|---|
| **Judul Proyek** | TobaWaterSafe – Sistem Pemantauan Status Kelayakan Zona Berenang dan Kondisi Pesisir Danau Toba Berbasis Web |
| **Nama / NIM** | [isi nama] / [isi NIM] |
| **Kelas** | [isi kelas] |
| **Dosen Pengampu** | [isi nama dosen] |
| **Tanggal** | Oktober 2026 |

> Catatan: sesuaikan urutan bab dan penomoran dengan template resmi dari dosen.

---

## 1. Pendahuluan

### 1.1 Latar Belakang
Kawasan Danau Toba merupakan destinasi wisata air unggulan dengan puluhan titik pantai dan pesisir rekreasi, antara lain Lumban Silintong (Balige), Pasir Putih Parbaba (Samosir), dan Pantai Bebas Parapat. Keselamatan dan kenyamanan wisatawan masih terkendala oleh:

1. **Pergeseran eceng gondok yang spontan.** Eceng gondok dapat berpindah masif karena arus angin dan menutupi bibir pantai dalam hitungan jam sehingga pantai tidak layak untuk berenang.
2. **Kedalaman air yang tidak merata.** Sebagian titik pesisir memiliki dasar yang curam mendadak (drop-off) yang membahayakan anak-anak dan wisatawan yang kurang mahir berenang.
3. **Tidak adanya pusat informasi keamanan air yang terkini.** Wisatawan bergantung pada kabar dari mulut ke mulut dan sering baru mengetahui kondisi pantai setelah tiba di lokasi.

### 1.2 Rumusan Masalah
1. Bagaimana menyediakan informasi status kelayakan berenang tiap pantai yang mudah diakses wisatawan?
2. Bagaimana petugas lapangan dapat memperbarui kondisi harian (eceng gondok, ombak, catatan) dengan cepat?
3. Bagaimana merancang REST API dan basis data yang sederhana, dapat diuji otomatis, dan mudah di-deploy?

### 1.3 Tujuan
1. Membangun aplikasi web pemantau status kelayakan zona berenang Danau Toba.
2. Menyediakan REST API mandiri (Express.js + SQLite) sebagai sumber data.
3. Menerapkan pengujian dan build otomatis menggunakan Jenkins.

### 1.4 Batasan Masalah
- Data bersumber dari input petugas, bukan sensor otomatis.
- Cakupan awal: beberapa titik pantai contoh di sekitar Danau Toba.
- [Tambahkan: apakah ada autentikasi admin atau tidak pada versi ini.]

### 1.5 Manfaat
Bagi wisatawan: informasi keselamatan sebelum berkunjung. Bagi pengelola: pusat pencatatan kondisi harian yang transparan.

---

## 2. Aktor Pengguna (User Persona)

| Aktor | Kebutuhan | Aktivitas utama |
|---|---|---|
| **Pengunjung / Wisatawan (publik)** | Mengetahui apakah pantai aman dan bersih sebelum berangkat | Melihat status terkini, mencari dan memfilter pantai ramah anak/aman, melihat fasilitas keselamatan (pos lifeguard, persewaan pelampung) |
| **Petugas Lapangan / Pengelola (Admin/Operator)** | Memperbarui kondisi perairan dengan cepat dari lapangan | Mengisi log harian (eceng gondok, ombak, catatan), mengelola data pantai, mengubah status operasional (misal penutupan darurat) |

---

## 3. Kebutuhan Fungsional

### 3.1 Fitur Publik
| Kode | Fitur | Deskripsi |
|---|---|---|
| F-01 | Katalog titik pesisir | Daftar pantai di sekitar Danau Toba (Toba, Samosir, Simalungun, dll.) |
| F-02 | Filter | Berdasarkan kabupaten, status kelayakan (Aman, Waspada, Bahaya), dan ketersediaan pelampung |
| F-03 | Status badge | 🟢 Aman & bersih; 🟡 Waspada (eceng gondok tipis / ombak sedang); 🔴 Bahaya / tutup sementara |
| F-04 | Detail pantai | Kedalaman rata-rata dan kontur, fasilitas keselamatan, catatan petugas beserta timestamp |
| F-08 | Peta Google Maps | Peta kawasan Danau Toba dengan penanda berwarna sesuai status (hijau aman, kuning waspada, merah bahaya) dan lingkaran kawasan di sekitar tiap pantai |

### 3.2 Fitur Manajemen
| Kode | Fitur | Deskripsi |
|---|---|---|
| F-05 | CRUD data pantai | Tambah, ubah, hapus titik pantai |
| F-06 | Daily Condition Logger | Form entri kondisi eceng gondok, tinggi ombak, dan rekomendasi berenang harian |
| F-07 | Login & registrasi petugas | Hanya petugas yang memiliki akun. Registrasi memerlukan kode petugas. Wisatawan tidak memiliki akun dan hanya dapat melihat informasi |

### 3.3 Kebutuhan Non-Fungsional
- Responsif (dapat diakses dari ponsel).
- Respons API dalam format JSON.
- Dapat dijalankan dan diuji tanpa server database eksternal.

---

## 4. Arsitektur Sistem

```
[ Browser: Vue 3 + Vite ]  --HTTP/JSON (axios)-->  [ Express.js API ]  --bun:sqlite-->  [ tobawatersafe.sqlite ]
        |
        +-- Google Maps JavaScript API (peta)
```

Hak akses: endpoint baca (GET) bersifat publik; endpoint tulis (POST/PUT/DELETE data pantai dan kondisi) mewajibkan token petugas yang diperoleh lewat login.

- **Front-End:** Vue 3, Vite, axios.
- **Back-End:** Express.js berjalan di runtime Bun.
- **Database:** SQLite file lokal `tobawatersafe.sqlite`.
- **CI/CD:** Jenkins (install, test, build).
- **Package manager / runtime:** Bun.

[Sisipkan diagram arsitektur / use case / flowchart di sini.]

---

## 5. Perancangan Basis Data

### 5.1 Tabel `beach_spots`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| nama_pantai | TEXT NOT NULL | Contoh: Pantai Pasir Putih Parbaba |
| kabupaten | TEXT NOT NULL | Contoh: Samosir |
| kedalaman_avg | REAL | Kedalaman rata-rata tepi pantai (meter) |
| is_ramah_anak | INTEGER | 1 landai, 0 dalam |
| ada_pelampung | INTEGER | 1 ada, 0 tidak |
| current_status | TEXT | `AMAN`, `WASPADA`, `BAHAYA` |
| latitude | REAL | Koordinat untuk peta |
| longitude | REAL | Koordinat untuk peta |
| created_at | DATETIME | Default current timestamp |

### 5.2 Tabel `daily_conditions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| spot_id | INTEGER FK → beach_spots.id | |
| kondisi_eceng_gondok | TEXT | `Bersih`, `Sedang`, `Pekat` |
| tinggi_ombak | TEXT | `Tenang`, `Sedang`, `Tinggi` |
| catatan_petugas | TEXT | Catatan bebas |
| updated_at | DATETIME | Default current timestamp |

### 5.3 Tabel pendukung autentikasi
| Tabel | Kolom | Keterangan |
|---|---|---|
| `users` | id, username (unik), nama, password_hash, created_at | Akun petugas. Password disimpan sebagai hash argon2id |
| `sessions` | token_hash (PK), user_id (FK → users.id), expires_at | Sesi login berlaku 7 hari. Token asli tidak disimpan, hanya hash SHA-256 |

### 5.4 Relasi
Satu `beach_spots` memiliki banyak `daily_conditions` (one-to-many). Penghapusan pantai ikut menghapus log terkait (`ON DELETE CASCADE`).

[Sisipkan ERD di sini.]

---

## 6. Spesifikasi REST API

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/spots` | Daftar pantai beserta kondisi terbaru; filter `?status=`, `?kabupaten=` |
| GET | `/api/spots/:id` | Detail satu pantai dan riwayat log kondisi |
| POST | `/api/spots` | Tambah pantai |
| PUT | `/api/spots/:id` | Ubah data / status pantai |
| DELETE | `/api/spots/:id` | Hapus pantai |
| POST | `/api/conditions` | Tambah laporan kondisi harian |
| POST | `/api/auth/register` | Registrasi petugas (memerlukan kode petugas) |
| POST | `/api/auth/login` | Login petugas, mengembalikan token |
| GET | `/api/auth/me` | Data petugas yang sedang login |
| POST | `/api/auth/logout` | Keluar |

Endpoint POST/PUT/DELETE pada `/api/spots` dan POST `/api/conditions` memerlukan header `Authorization: Bearer <token>`. GET bersifat publik.

Contoh respons `GET /api/spots`:
```json
{ "count": 1, "data": [ { "id": 1, "nama_pantai": "Pantai Lumban Silintong", "kabupaten": "Toba", "current_status": "AMAN", "kondisi_eceng_gondok": "Bersih", "tinggi_ombak": "Tenang" } ] }
```

---

## 7. Perancangan Front-End (Vue 3)

| Komponen | Fungsi |
|---|---|
| `Navbar.vue`, `Footer.vue` | Navigasi utama |
| `SpotCard.vue` | Kartu ringkas pantai dengan badge warna dinamis sesuai status |
| `FilterBar.vue` | Dropdown reaktif untuk kabupaten dan status |
| `SpotDetail.vue` | Detail fasilitas dan riwayat log petugas |
| `AdminLogModal.vue` | Modal form entri cepat untuk petugas |
| `MapView.vue` | Peta Google Maps dengan penanda berwarna per status |
| `LoginPanel.vue` | Form login dan registrasi petugas |
| `SpotForm.vue` | Form tambah/ubah data pantai termasuk koordinat |

[Sisipkan mockup / tangkapan layar antarmuka.]

---

## 8. Strategi Pengujian dan CI/CD (Jenkins)

- Database SQLite berbasis file (in-memory saat test) sehingga tidak memerlukan server database tambahan.
- Pipeline: Checkout → `bun install` → `bun test` (back-end) → `bun install` + `bun run build` (front-end) → arsip `dist/`.
- [Lampirkan tangkapan layar hasil build Jenkins.]

---

## 9. Rencana Pengerjaan

| Tahap | Kegiatan | Status |
|---|---|---|
| 1 | Dokumen proyek dan inisialisasi repository | [ ] |
| 2 | Back-End: skema DB, seluruh endpoint, unit test | [ ] |
| 3 | Front-End: komponen dan integrasi API | [ ] |
| 4 | Jenkins: pipeline dan bukti hasil | [ ] |
| 5 | Deployment online | [ ] |
| 6 | Video YouTube (mulai dari `git clone`) | [ ] |

## 10. Artefak Pengumpulan

| No | Artefak | Tautan |
|---|---|---|
| 1 | Dokumen Proyek 1 | [isi] |
| 2 | Repository GitHub | [isi] |
| 3 | Hasil pengujian Jenkins | [isi] |
| 4 | URL aplikasi online | [isi] |
| 5 | URL video YouTube | [isi] |

## 11. Penutup
[Ringkasan hasil dan rencana pengembangan lanjutan.]

## Daftar Pustaka
[Isi sesuai kebutuhan, misal dokumentasi Express.js, Vue 3, Bun, SQLite.]
