import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { createDb, seedIfEmpty } from "../src/db.js";
import { createApp } from "../src/app.js";

let server, base, db;

beforeAll(async () => {
  db = createDb(":memory:"); // tanpa file, tanpa server DB eksternal
  seedIfEmpty(db);
  db.run(
    `INSERT INTO daily_conditions (spot_id, kondisi_eceng_gondok, tinggi_ombak, catatan_petugas)
     VALUES (1, 'Bersih', 'Tenang', 'Kondisi baik')`
  );
  server = createApp(db).listen(0);
  base = `http://localhost:${server.address().port}`;
});

afterAll(() => server.close());

describe("GET /api/spots", () => {
  test("mengembalikan seluruh pantai beserta kondisi terbaru", async () => {
    const res = await fetch(`${base}/api/spots`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.count).toBe(3);
    const silintong = body.data.find((s) => s.nama_pantai === "Pantai Lumban Silintong");
    expect(silintong.kondisi_eceng_gondok).toBe("Bersih");
  });

  test("filter ?status=WASPADA", async () => {
    const body = await (await fetch(`${base}/api/spots?status=WASPADA`)).json();
    expect(body.count).toBe(1);
    expect(body.data[0].kabupaten).toBe("Simalungun");
  });

  test("filter ?kabupaten=samosir (tidak peka huruf besar/kecil)", async () => {
    const body = await (await fetch(`${base}/api/spots?kabupaten=samosir`)).json();
    expect(body.count).toBe(1);
  });

  test("status tidak valid menghasilkan 400", async () => {
    const res = await fetch(`${base}/api/spots?status=XYZ`);
    expect(res.status).toBe(400);
  });
});
