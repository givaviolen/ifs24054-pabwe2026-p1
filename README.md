# TobaWaterSafe — Front-End (`ifs24054-pabwe2026-p1`)

Antarmuka web **Vue 3 + Vite** untuk memantau status kelayakan zona berenang dan kondisi pesisir
Danau Toba. Package manager & runtime: **Bun**. CI: **Jenkins**. Deploy: **Vercel**.

Back-End (Express + SQLite) ada di repo terpisah: `ifs24054-pabwe2026-proyek1-be`.

- **Wisatawan** (tanpa akun): beranda, daftar pantai (cari, filter kabupaten/status/pelampung/ramah anak, urutkan), peta berwarna, detail kondisi terkini + riwayat.
- **Petugas** (login): tambah/ubah/hapus pantai (CRUD) dan catat kondisi harian.
- Rute: `/beranda`, `/daftar`, `/peta`, `/pantai/:id`, `/auth/login`, `/auth/register`, `/petugas`, `/petugas/pantai`, `/petugas/pantai/tambah`, `/petugas/kondisi`.

## Struktur

View hanya merakit komponen; logika ada di composable/utils; akses API ada di services. Klien HTTP menggunakan Fetch API dengan timeout, retry terbatas untuk GET, dan normalisasi error.

```
src/
├── App.vue                  # kerangka halaman + pemilihan view
├── main.js  style.css
├── views/                   # HomeView SpotsView AdminView NotFoundView
├── components/
│   ├── layout/              # Navbar Footer
│   ├── common/              # StatusBadge ApiAlert LakeScene
│   ├── home/                # Hero Showcase Stats About Education (section Beranda)
│   ├── spots/               # SpotCard SpotDetail SpotForm FilterBar
│   ├── map/                 # MapView GoogleMapPane LeafletMapPane
│   ├── admin/               # AdminSummary AdminSpotTable AdminLogTable AdminLogModal
│   └── auth/                # LoginPanel
├── composables/             # state & alur: useSpots useAuth useRoute useRouteGuard
│                            # useSpotActions useLogDialog useNotice
├── services/                # httpClient (axios) spotApi authApi apiError tokenStorage googleMaps
├── utils/                   # fungsi murni: route date status spotSort spotSearch
│                            # spotFilters spotStats spotForm apiUrl mapShared
├── constants/               # status (label/ikon/warna), navigation
├── config/env.js            # pembacaan variabel lingkungan Vite
├── data/                    # konten statis (edukasi, foto pantai)
└── styles/home.css          # gaya bersama section Beranda
tests/                       # bun test untuk fungsi murni
```

## Menjalankan lokal

Prasyarat: [Bun](https://bun.sh). Jalankan Back-End lebih dulu (lihat README repo `-be`).

```bash
bun install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
bun run dev               # http://localhost:5173
bun run build             # hasil di dist/
bun test                  # tes unit fungsi murni
```

## Menghubungkan ke Back-End

Isi `VITE_API_URL` (akhiran `/api` boleh ditulis atau tidak):

| Lingkungan | Nilai |
|---|---|
| Lokal | `http://localhost:3000/api` |
| Produksi (Vercel) | `https://<project-backend>.vercel.app/api` |

Di Vercel: **Project Front-End → Settings → Environment Variables → `VITE_API_URL`**, lalu **Redeploy**
(variabel `VITE_*` ditanam saat build, jadi wajib build ulang setelah mengubahnya).

Jika API tidak terjangkau, aplikasi menampilkan pesan beserta petunjuk penyebabnya dan tombol **Coba lagi**.

## Peta

Tanpa API key, peta memakai OpenStreetMap otomatis. Untuk Google Maps, isi `VITE_GOOGLE_MAPS_API_KEY`
(Maps JavaScript API, batasi key ke domain Anda).

## Jenkins

Agent harus memiliki Bun. Pipeline: install → `bun run build` → arsip `dist/`.
