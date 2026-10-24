# TobaWaterSafe — Front-End (`ifs24054-pabwe2026-p1`)

Antarmuka web **Vue 3 + Vite** (axios) untuk memantau status kelayakan zona berenang dan kondisi pesisir
Danau Toba. Package manager & runtime: **Bun**. CI: **Jenkins**. Deploy: **Vercel**.

Back-End (Express + SQLite) ada di repo terpisah: `ifs24054-pabwe2026-proyek1-be`.

- **Wisatawan** (tanpa akun): beranda, daftar pantai (cari, filter kabupaten/status/pelampung/ramah anak, urutkan), peta berwarna, detail kondisi terkini + riwayat.
- **Petugas** (login): tambah/ubah/hapus pantai (CRUD) dan catat kondisi harian.
- Rute: `#/beranda`, `#/daftar`, `#/peta`, `#/pantai/:id`, `#/petugas`.

## Struktur

```
src/
├── App.vue                  # kerangka + routing
├── views/                   # HomeView  SpotsView  AdminView
├── components/              # Navbar Footer SpotCard FilterBar SpotDetail AdminLogModal
│                            # SpotForm LoginPanel MapView StatusBadge ApiAlert ...
├── composables/             # useSpots  useAuth  useRoute
├── services/                # api.js (axios)  googleMaps.js
└── utils/                   # format.js  route.js  mapShared.js
```

## Menjalankan lokal

Prasyarat: [Bun](https://bun.sh). Jalankan Back-End lebih dulu (lihat README repo `-be`).

```bash
bun install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
bun run dev               # http://localhost:5173
bun run build             # hasil di dist/
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
