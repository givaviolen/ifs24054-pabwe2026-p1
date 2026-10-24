# TobaWaterSafe

Sistem Pemantauan Status Kelayakan Zona Berenang dan Kondisi Pesisir Danau Toba Berbasis Web.

Stack: **Express.js + SQLite (`bun:sqlite`)** · **Vue 3 + Vite** · **Google Maps JavaScript API** · runtime & package manager **Bun** · CI **Jenkins**.

- **Wisatawan** (tanpa akun): beranda informasi, daftar pantai dengan filter, peta berwarna, dan detail kondisi.
  Halaman: `#/beranda`, `#/daftar`, `#/peta`, `#/pantai/:id`, `#/petugas`.
- **Petugas** (wajib login): kelola data pantai dan catat kondisi harian.

## Struktur

```
tobawatersafe/
├── Jenkinsfile
├── docs/Dokumen_Proyek_1.md
├── backend/
│   ├── .env.example                  # PETUGAS_CODE, PORT
│   ├── src/  db.js  auth.js  app.js  server.js
│   └── tests/ db.test.js  auth.test.js  spots.test.js  crud.test.js
└── frontend/
    ├── .env.example                  # VITE_API_URL, VITE_GOOGLE_MAPS_API_KEY
    └── src/
        ├── App.vue                       # kerangka + routing
        ├── views/ HomeView  SpotsView  AdminView
        ├── composables/ useAuth  useRoute  useSpots
        ├── utils/route.js
        ├── services/ api.js  googleMaps.js
        └── components/ Navbar  Footer  SpotCard  FilterBar  SpotDetail
                        MapView  LoginPanel  SpotForm  AdminLogModal  StatusBadge
    └── public/images/                # hero.jpg, galeri-1..4.jpg (opsional)
```

## Menjalankan di komputer lokal

Prasyarat: [Bun](https://bun.sh), Git.

```bash
git clone <URL-REPO-ANDA>
cd tobawatersafe

# Terminal 1 - API di http://localhost:3000
cd backend
cp .env.example .env        # Windows PowerShell: copy .env.example .env
bun install
bun run dev

# Terminal 2 - Front-End di http://localhost:5173
cd frontend
cp .env.example .env        # Windows PowerShell: copy .env.example .env
bun install
bun run dev
```

Database `backend/tobawatersafe.sqlite` dibuat otomatis berisi 17 pantai contoh. Database lama otomatis
dimigrasi (kolom koordinat ditambahkan) tanpa menghapus data.

## Akun petugas

1. Buka aplikasi, klik **Login Petugas**, pilih tab **Registrasi**.
2. Isi username, nama, password, dan **kode registrasi petugas** (nilai `PETUGAS_CODE` di `backend/.env`, bawaan `TOBA2026`).
3. Setelah itu login seperti biasa. Wisatawan tidak memiliki fitur login maupun registrasi.

> Ganti `PETUGAS_CODE` sebelum deployment. Siapa pun yang tahu kode ini dapat membuat akun petugas.

## Peta Google Maps

Peta memakai Google Maps JavaScript API dan membutuhkan API key:

1. Buka [Google Cloud Console](https://console.cloud.google.com/), buat/pilih project.
2. Aktifkan **Maps JavaScript API** (menu *APIs & Services → Library*).
3. Pasang akun penagihan (*billing*). Google memberi kuota gratis bulanan, tetapi akun penagihan tetap diwajibkan.
4. *APIs & Services → Credentials → Create credentials → API key*.
5. Batasi key (*Application restrictions → Websites*): `http://localhost:5173/*` dan alamat situs deployment Anda.
6. Isi `frontend/.env`: `VITE_GOOGLE_MAPS_API_KEY=KEY_ANDA`, lalu jalankan ulang `bun run dev`.

Warna penanda: 🟢 Aman · 🟡 Waspada · 🔴 Bahaya. Lingkaran di sekitar titik menandai kawasan pantai.
Tanpa API key, seluruh aplikasi tetap berjalan; hanya tab Peta yang menampilkan petunjuk.

Koordinat pantai pada data contoh adalah **perkiraan**. Periksa di Google Maps dan perbaiki lewat Panel Petugas → Ubah.

## Pengujian & build

```bash
cd backend  && bun test
cd frontend && bun run build   # hasil di frontend/dist
```

## Endpoint API

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/spots` | publik | Daftar pantai + koordinat + kondisi terbaru. Filter: `status`, `kabupaten`, `ada_pelampung`, `ramah_anak` |
| GET | `/api/spots/:id` | publik | Detail + riwayat log |
| POST | `/api/spots` | petugas | Tambah pantai (termasuk `latitude`, `longitude`) |
| PUT | `/api/spots/:id` | petugas | Ubah pantai (parsial) |
| DELETE | `/api/spots/:id` | petugas | Hapus pantai (log ikut terhapus) |
| POST | `/api/conditions` | petugas | Tambah log harian; status pantai diperbarui otomatis (atau manual lewat `current_status`) |
| POST | `/api/auth/register` | kode petugas | Buat akun petugas, mengembalikan token |
| POST | `/api/auth/login` | publik | Login, mengembalikan token |
| GET | `/api/auth/me` | petugas | Data akun yang sedang login |
| POST | `/api/auth/logout` | petugas | Akhiri sesi |

Endpoint petugas memerlukan header `Authorization: Bearer <token>`.

## Jenkins

Agent harus memiliki Bun (`curl -fsSL https://bun.sh/install | bash`). Pipeline: install → `bun test` → `bun run build` → arsip `dist/`.
Test memakai SQLite `:memory:` sehingga tidak butuh server database, dan tidak membutuhkan API key Google Maps.
