// Inisialisasi database SQLite memakai driver bawaan Bun (bun:sqlite).
// Tidak perlu paket tambahan seperti better-sqlite3.
import { Database } from "bun:sqlite";

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS beach_spots (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_pantai    TEXT    NOT NULL,
  kabupaten      TEXT    NOT NULL,
  kedalaman_avg  REAL,
  is_ramah_anak  INTEGER NOT NULL DEFAULT 0 CHECK (is_ramah_anak IN (0, 1)),
  ada_pelampung  INTEGER NOT NULL DEFAULT 0 CHECK (ada_pelampung IN (0, 1)),
  current_status TEXT    NOT NULL DEFAULT 'AMAN'
                 CHECK (current_status IN ('AMAN', 'WASPADA', 'BAHAYA')),
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_conditions (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  spot_id              INTEGER NOT NULL,
  kondisi_eceng_gondok TEXT NOT NULL
                       CHECK (kondisi_eceng_gondok IN ('Bersih', 'Sedang', 'Pekat')),
  tinggi_ombak         TEXT NOT NULL
                       CHECK (tinggi_ombak IN ('Tenang', 'Sedang', 'Tinggi')),
  catatan_petugas      TEXT,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spot_id) REFERENCES beach_spots(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conditions_spot
  ON daily_conditions (spot_id, updated_at DESC);
`;

const SEED_SPOTS = [
  ["Pantai Lumban Silintong", "Toba", 1.5, 1, 1, "AMAN"],
  ["Pantai Pasir Putih Parbaba", "Samosir", 1.2, 1, 1, "AMAN"],
  ["Pantai Bebas Parapat", "Simalungun", 2.8, 0, 0, "WASPADA"],
];

export function createDb(path = process.env.DB_PATH || "tobawatersafe.sqlite") {
  const db = new Database(path, { create: true });
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;"); // wajib diaktifkan per koneksi di SQLite
  db.exec(SCHEMA);
  return db;
}

// Isi data contoh hanya bila tabel masih kosong.
export function seedIfEmpty(db) {
  const { total } = db.query("SELECT COUNT(*) AS total FROM beach_spots").get();
  if (total > 0) return;
  const insert = db.prepare(
    `INSERT INTO beach_spots
       (nama_pantai, kabupaten, kedalaman_avg, is_ramah_anak, ada_pelampung, current_status)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  db.transaction(() => SEED_SPOTS.forEach((row) => insert.run(...row)))();
}
