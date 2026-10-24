import { describe, test, expect } from "bun:test";
import { Database } from "bun:sqlite";
import { createDb, seedSpots, migrate, SEED_SPOTS } from "../src/db.js";

describe("data pantai", () => {
  test("nama unik, status valid, koordinat berada di sekitar Danau Toba", () => {
    const names = SEED_SPOTS.map((s) => s[0]);
    expect(new Set(names).size).toBe(names.length);
    expect(SEED_SPOTS.length).toBeGreaterThanOrEqual(15);
    for (const [, , , , , status, lat, lng] of SEED_SPOTS) {
      expect(["AMAN", "WASPADA", "BAHAYA"]).toContain(status);
      expect(lat).toBeGreaterThan(2.0); expect(lat).toBeLessThan(3.1);
      expect(lng).toBeGreaterThan(98.4); expect(lng).toBeLessThan(99.2);
    }
  });

  test("seedSpots idempotent (dijalankan dua kali tidak menggandakan data)", () => {
    const db = createDb(":memory:");
    seedSpots(db); seedSpots(db);
    expect(db.query("SELECT COUNT(*) AS n FROM beach_spots").get().n).toBe(SEED_SPOTS.length);
  });

  test("tiga warna status semuanya ada pada data contoh", () => {
    const db = createDb(":memory:");
    seedSpots(db);
    const s = db.query("SELECT DISTINCT current_status AS s FROM beach_spots").all().map((r) => r.s);
    expect(s.sort()).toEqual(["AMAN", "BAHAYA", "WASPADA"]);
  });
});

describe("migrasi database lama", () => {
  test("menambah kolom koordinat, mempertahankan data, dan melengkapi koordinat", () => {
    const old = new Database(":memory:");
    old.exec(`CREATE TABLE beach_spots (
      id INTEGER PRIMARY KEY AUTOINCREMENT, nama_pantai TEXT NOT NULL, kabupaten TEXT NOT NULL,
      kedalaman_avg REAL, is_ramah_anak INTEGER, ada_pelampung INTEGER,
      current_status TEXT DEFAULT 'AMAN', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    old.run("INSERT INTO beach_spots (nama_pantai,kabupaten,current_status) VALUES ('Pantai Bebas Parapat','Simalungun','BAHAYA')");
    migrate(old);
    seedSpots(old);
    const row = old.query("SELECT * FROM beach_spots WHERE nama_pantai='Pantai Bebas Parapat'").get();
    expect(row.current_status).toBe("BAHAYA"); // status petugas tidak ditimpa
    expect(row.latitude).toBeGreaterThan(2);
    expect(old.query("SELECT COUNT(*) AS n FROM beach_spots").get().n).toBe(SEED_SPOTS.length);
  });
});
