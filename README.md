# TobaWaterSafe

Sistem Pemantauan Status Kelayakan Zona Berenang dan Kondisi Pesisir Danau Toba Berbasis Web.

Stack: **Express.js + SQLite (`bun:sqlite`)** · **Vue 3 + Vite** · runtime & package manager **Bun** · CI **Jenkins**.

## Struktur

```
tobawatersafe/
├── Jenkinsfile
├── docs/Dokumen_Proyek_1.md
├── backend/    src/{db,app,server}.js, tests/*.test.js
└── frontend/   src/{App.vue, components/, services/api.js}
```

## Menjalankan di komputer lokal

Prasyarat: [Bun](https://bun.sh), Git.

```bash
git clone <URL-REPO-ANDA>
cd tobawatersafe

# Terminal 1 - API di http://localhost:3000
cd backend
bun install
bun run dev

# Terminal 2 - Front-End di http://localhost:5173
cd frontend
cp .env.example .env
bun install
bun run dev
```

Database `tobawatersafe.sqlite` dibuat otomatis di folder `backend/` beserta 3 data contoh.

## Pengujian & build

```bash
cd backend  && bun test
cd frontend && bun run build   # hasil di frontend/dist
```

## Endpoint API

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/spots` | Daftar pantai + kondisi terbaru. Filter: `status`, `kabupaten`, `ada_pelampung`, `ramah_anak` |
| GET | `/api/spots/:id` | Detail + riwayat log |
| POST | `/api/spots` | Tambah pantai |
| PUT | `/api/spots/:id` | Ubah pantai (parsial) |
| DELETE | `/api/spots/:id` | Hapus pantai (log ikut terhapus) |
| POST | `/api/conditions` | Tambah log harian; status pantai diperbarui otomatis (atau manual lewat `current_status`) |

## Jenkins

Agent harus memiliki Bun (`curl -fsSL https://bun.sh/install | bash`). Pipeline: install → `bun test` → `bun run build` → arsip `dist/`. Test memakai SQLite `:memory:` sehingga tidak butuh server database.
