import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { flush, mount } from "./helpers";

vi.mock("../src/services/spotApi", () => ({
  getSpots: vi.fn(),
  getSpot: vi.fn(),
  createSpot: vi.fn(),
  updateSpot: vi.fn(),
  deleteSpot: vi.fn(),
  addCondition: vi.fn(),
}));

import * as api from "../src/services/spotApi";
import * as spotsMod from "../src/composables/useSpots";
import { useSpotActions } from "../src/composables/useSpotActions";
import { useLogDialog } from "../src/composables/useLogDialog";
import { useNotice } from "../src/composables/useNotice";
import { route, go } from "../src/composables/useRoute";
import { defineComponent, h } from "vue";

const S = (id, over = {}) => ({ id, nama_pantai: `P${id}`, kabupaten: "Toba", current_status: "AMAN", ...over });

beforeEach(async () => {
  vi.clearAllMocks();
  api.getSpots.mockResolvedValue({ data: [] });
  spotsMod.resetFilters();
  await flush(2);
  vi.clearAllMocks();
  api.getSpots.mockResolvedValue({ data: [] });
  spotsMod.spots.value = [];
  spotsMod.allSpots.value = [];
  spotsMod.apiError.value = null;
  spotsMod.loading.value = false;
});

describe("useSpots", () => {
  test("loadSpots mengisi data terfilter dan semua data", async () => {
    api.getSpots.mockImplementation(async (params) =>
      Object.keys(params).length ? { data: [S(1)] } : { data: [S(1), S(2)] }
    );
    spotsMod.filters.q = "p1";
    await flush(3);
    api.getSpots.mockClear();
    await spotsMod.loadSpots();
    expect(spotsMod.spots.value).toEqual([S(1)]);
    expect(spotsMod.allSpots.value).toEqual([S(1), S(2)]);
    expect(spotsMod.loading.value).toBe(false);
    expect(spotsMod.apiError.value).toBeNull();
    expect(api.getSpots).toHaveBeenCalledTimes(2);
  });

  test("kabupatenList unik dan terurut; filtersActive; sortedSpots", async () => {
    spotsMod.allSpots.value = [
      S(1, { kabupaten: "Toba" }), S(2, { kabupaten: "Karo" }), S(3, { kabupaten: "Toba" }),
    ];
    expect(spotsMod.kabupatenList.value).toEqual(["Karo", "Toba"]);

    spotsMod.spots.value = [S(2, { nama_pantai: "B" }), S(1, { nama_pantai: "A" })];
    expect(spotsMod.sortedSpots.value.map((s) => s.nama_pantai)).toEqual(["A", "B"]);

    expect(spotsMod.filtersActive.value).toBe(false);
    spotsMod.filters.status = "AMAN";
    expect(spotsMod.filtersActive.value).toBe(true);
    await flush(2);
  });

  test("mengubah filter otomatis memuat ulang data", async () => {
    api.getSpots.mockClear();
    spotsMod.filters.kabupaten = "Toba";
    await flush(3);
    expect(api.getSpots).toHaveBeenCalled();
    expect(api.getSpots.mock.calls.some(([p]) => p.kabupaten === "Toba")).toBe(true);
  });

  test("error API disimpan sebagai apiError dan bisa ditutup", async () => {
    api.getSpots.mockRejectedValue({ code: "ECONNABORTED" });
    await spotsMod.loadSpots();
    expect(spotsMod.apiError.value.kind).toBe("timeout");
    expect(spotsMod.loading.value).toBe(false);
    spotsMod.dismissApiError();
    expect(spotsMod.apiError.value).toBeNull();
  });

  test("respons lama tidak menimpa permintaan yang lebih baru (sukses)", async () => {
    let resolveOld;
    api.getSpots.mockImplementationOnce(() => new Promise((r) => { resolveOld = () => r({ data: [S(99)] }); }));
    api.getSpots.mockImplementationOnce(() => new Promise((r) => { resolveOld.second = () => r({ data: [S(99)] }); }));
    const oldReq = spotsMod.loadSpots();
    api.getSpots.mockResolvedValue({ data: [S(1)] });
    const newReq = spotsMod.loadSpots();
    await newReq;
    resolveOld();
    resolveOld.second();
    await oldReq;
    expect(spotsMod.allSpots.value).toEqual([S(1)]);
    expect(spotsMod.loading.value).toBe(false);
  });

  test("respons error lama juga diabaikan", async () => {
    let rejectOld;
    api.getSpots.mockImplementationOnce(() => new Promise((_, rej) => { rejectOld = () => rej(new Error("lama")); }));
    api.getSpots.mockImplementationOnce(() => new Promise(() => {}));
    const oldReq = spotsMod.loadSpots();
    api.getSpots.mockResolvedValue({ data: [S(5)] });
    await spotsMod.loadSpots();
    rejectOld();
    await oldReq;
    expect(spotsMod.apiError.value).toBeNull();
    expect(spotsMod.allSpots.value).toEqual([S(5)]);
  });

  test("resetFilters mengembalikan filter dan urutan awal", async () => {
    spotsMod.filters.q = "x";
    spotsMod.filters.ramah_anak = true;
    spotsMod.sortBy.value = "aman";
    spotsMod.resetFilters();
    expect(spotsMod.filters).toMatchObject({ q: "", kabupaten: "", status: "", ada_pelampung: false, ramah_anak: false });
    expect(spotsMod.sortBy.value).toBe("nama");
    await flush(2);
  });
});

describe("useSpotActions", () => {
  test("create/update/remove berhasil: memuat ulang dan memberi tahu", async () => {
    const notify = vi.fn();
    const act = useSpotActions(notify);
    api.createSpot.mockResolvedValue({});
    api.updateSpot.mockResolvedValue({});
    api.deleteSpot.mockResolvedValue({});

    expect(await act.create({ a: 1 })).toBe(true);
    expect(api.createSpot).toHaveBeenCalledWith({ a: 1 });
    expect(notify).toHaveBeenLastCalledWith("ok", "Pantai baru berhasil ditambahkan.");

    expect(await act.update(4, { b: 2 })).toBe(true);
    expect(api.updateSpot).toHaveBeenCalledWith(4, { b: 2 });
    expect(notify).toHaveBeenLastCalledWith("ok", "Data pantai berhasil diperbarui.");

    expect(await act.remove({ id: 4, nama_pantai: "Parbaba" })).toBe(true);
    expect(api.deleteSpot).toHaveBeenCalledWith(4);
    expect(notify).toHaveBeenLastCalledWith("ok", "Parbaba dihapus.");
    expect(api.getSpots).toHaveBeenCalled();
  });

  test("gagal: mengembalikan false dan memberi pesan error", async () => {
    const notify = vi.fn();
    const act = useSpotActions(notify);
    api.createSpot.mockRejectedValue({ response: { status: 400, data: { error: "Nama wajib diisi" } } });
    expect(await act.create({})).toBe(false);
    expect(notify).toHaveBeenLastCalledWith("err", "Nama wajib diisi");

    api.updateSpot.mockRejectedValue(new Error("x"));
    expect(await act.update(1, {})).toBe(false);
    expect(notify).toHaveBeenLastCalledWith("err", "Gagal menyimpan data.");

    api.deleteSpot.mockRejectedValue(new Error("x"));
    expect(await act.remove({ id: 1, nama_pantai: "A" })).toBe(false);
    expect(notify).toHaveBeenLastCalledWith("err", "Gagal menghapus data.");
  });
});

describe("useLogDialog", () => {
  beforeEach(() => {
    go("/petugas/kondisi", { replace: true });
  });

  test("open, close, dan afterSaved mengatur dialog", () => {
    const d = useLogDialog(() => "admin-log");
    expect(d.visible.value).toBe(false);
    d.open(3);
    expect(d.visible.value).toBe(true);
    expect(d.spotId.value).toBe(3);
    d.close();
    expect(d.visible.value).toBe(false);
    d.open();
    expect(d.spotId.value).toBeNull();
    d.afterSaved();
    expect(d.visible.value).toBe(false);
  });

  test("alamat ?spot=ID langsung membuka dialog setelah data pantai ada", async () => {
    go("/petugas/kondisi?spot=7", { replace: true });
    const d = useLogDialog(() => "admin-log");
    expect(d.visible.value).toBe(false); // data pantai belum dimuat
    spotsMod.allSpots.value = [S(7)];
    await nextTick();
    expect(d.visible.value).toBe(true);
    expect(d.spotId.value).toBe(7);

    d.close(); // ?spot dibersihkan dari alamat
    expect(route.query.spot).toBeUndefined();
    expect(window.location.search).toBe("");
  });

  test("tidak membuka dialog di halaman lain", async () => {
    go("/petugas/kondisi?spot=7", { replace: true });
    spotsMod.allSpots.value = [S(7)];
    const d = useLogDialog(() => "admin");
    await nextTick();
    expect(d.visible.value).toBe(false);
  });
});

describe("useNotice", () => {
  afterEach(() => vi.useRealTimers());

  test("pesan muncul lalu hilang sendiri; timer dibersihkan saat komponen dilepas", async () => {
    vi.useFakeTimers();
    let api2;
    const C = defineComponent({
      setup() {
        api2 = useNotice(1000);
        return () => h("div");
      },
    });
    const m = mount(C);
    api2.notify("ok", "Halo");
    expect(api2.notice.value).toEqual({ type: "ok", text: "Halo" });
    vi.advanceTimersByTime(500);
    api2.notify("err", "Ganti"); // timer lama direset
    vi.advanceTimersByTime(600);
    expect(api2.notice.value).toEqual({ type: "err", text: "Ganti" });
    vi.advanceTimersByTime(500);
    expect(api2.notice.value).toBeNull();

    api2.notify("ok", "Lagi");
    m.unmount();
    vi.advanceTimersByTime(5000);
    expect(api2.notice.value).toEqual({ type: "ok", text: "Lagi" }); // timer sudah dibatalkan
  });
});