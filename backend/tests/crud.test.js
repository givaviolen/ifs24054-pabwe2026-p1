import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { createDb, seedIfEmpty } from "../src/db.js";
import { createApp, deriveStatus } from "../src/app.js";

let server, base;
const json = (method, path, body) =>
  fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

beforeAll(() => {
  const db = createDb(":memory:");
  seedIfEmpty(db);
  server = createApp(db).listen(0);
  base = `http://localhost:${server.address().port}`;
});
afterAll(() => server.close());

test("deriveStatus", () => {
  expect(deriveStatus("Bersih", "Tenang")).toBe("AMAN");
  expect(deriveStatus("Sedang", "Tenang")).toBe("WASPADA");
  expect(deriveStatus("Bersih", "Tinggi")).toBe("BAHAYA");
});

describe("CRUD /api/spots", () => {
  let id;
  test("POST membuat pantai", async () => {
    const res = await json("POST", "/api/spots", { nama_pantai: "Pantai Uji", kabupaten: "Toba", kedalaman_avg: 1.1, is_ramah_anak: 1 });
    expect(res.status).toBe(201);
    id = (await res.json()).data.id;
    expect(id).toBeGreaterThan(0);
  });
  test("POST tanpa nama -> 400", async () => {
    expect((await json("POST", "/api/spots", { kabupaten: "Toba" })).status).toBe(400);
  });
  test("GET detail menyertakan history", async () => {
    const body = await (await fetch(`${base}/api/spots/${id}`)).json();
    expect(body.data.nama_pantai).toBe("Pantai Uji");
    expect(Array.isArray(body.data.history)).toBe(true);
  });
  test("PUT mengubah status", async () => {
    const body = await (await json("PUT", `/api/spots/${id}`, { current_status: "BAHAYA" })).json();
    expect(body.data.current_status).toBe("BAHAYA");
  });
  test("POST /api/conditions memperbarui status pantai", async () => {
    const res = await json("POST", "/api/conditions", { spot_id: id, kondisi_eceng_gondok: "Bersih", tinggi_ombak: "Tenang", catatan_petugas: "Aman" });
    expect(res.status).toBe(201);
    const detail = await (await fetch(`${base}/api/spots/${id}`)).json();
    expect(detail.data.current_status).toBe("AMAN");
    expect(detail.data.history.length).toBe(1);
  });
  test("conditions dengan input tidak valid -> 400", async () => {
    expect((await json("POST", "/api/conditions", { spot_id: id, kondisi_eceng_gondok: "X", tinggi_ombak: "Tenang" })).status).toBe(400);
  });
  test("conditions untuk pantai tak ada -> 404", async () => {
    expect((await json("POST", "/api/conditions", { spot_id: 9999, kondisi_eceng_gondok: "Bersih", tinggi_ombak: "Tenang" })).status).toBe(404);
  });
  test("DELETE menghapus pantai beserta log", async () => {
    expect((await json("DELETE", `/api/spots/${id}`)).status).toBe(200);
    expect((await fetch(`${base}/api/spots/${id}`)).status).toBe(404);
    expect((await json("DELETE", `/api/spots/${id}`)).status).toBe(404);
  });
});
