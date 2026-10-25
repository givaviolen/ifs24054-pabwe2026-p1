import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { h, nextTick } from "vue";
import { flush, mount, spotFixture } from "./helpers";

vi.mock("../src/services/spotApi", () => ({
  getSpots: vi.fn(),
  getSpot: vi.fn(),
  createSpot: vi.fn(),
  updateSpot: vi.fn(),
  deleteSpot: vi.fn(),
  addCondition: vi.fn(),
}));
vi.mock("../src/components/map/MapView.vue", () => ({
  __esModule: true,
  default: {
    name: "MapViewStub",
    props: ["spots"],
    emits: ["select"],
    render() {
      return h("div", { class: "map-stub" }, [h("button", { class: "pick", onClick: () => this.$emit("select", 5) })]);
    },
  },
}));

import * as api from "../src/services/spotApi";
import * as spotsMod from "../src/composables/useSpots";
import { auth } from "../src/composables/useAuth";
import { route, go } from "../src/composables/useRoute";
import SpotsView from "../src/views/SpotsView.vue";
import HomeView from "../src/views/HomeView.vue";
import AdminView from "../src/views/AdminView.vue";

const SPOTS = [
  spotFixture({ id: 1, nama_pantai: "Alpha", kabupaten: "Toba", current_status: "AMAN" }),
  spotFixture({ id: 2, nama_pantai: "Bravo", kabupaten: "Samosir", current_status: "BAHAYA", kondisi_updated_at: "2026-01-01 10:00:00" }),
];

let current;
const show = (component, props) => (current = mount(component, props));

const setValue = (el, value, type = "input") => {
  el.value = value;
  el.dispatchEvent(new Event(type, { bubbles: true }));
};

beforeEach(async () => {
  vi.clearAllMocks();
  HTMLDialogElement.prototype.showModal = vi.fn();
  api.getSpots.mockResolvedValue({ data: SPOTS });
  spotsMod.resetFilters();
  await flush(2);
  vi.clearAllMocks();
  api.getSpots.mockResolvedValue({ data: SPOTS });
  spotsMod.spots.value = SPOTS;
  spotsMod.allSpots.value = SPOTS;
  spotsMod.apiError.value = null;
  spotsMod.loading.value = false;
  auth.user = { id: 1, nama: "Budi" };
  auth.ready = true;
  go("/beranda", { replace: true });
});

afterEach(() => {
  current?.unmount();
  current = null;
});

describe("SpotsView", () => {
  test("mode daftar: judul, jumlah, kartu pantai terurut, dan pilihan urutan", async () => {
    const m = show(SpotsView, { mode: "list" });
    expect(m.el.querySelector("h1").textContent).toBe("Daftar Pantai");
    expect(m.el.querySelector(".count").textContent).toContain("Menampilkan 2 pantai");
    expect(m.el.querySelectorAll("article.spot")).toHaveLength(2);
    expect(m.el.querySelectorAll("select")).toHaveLength(3); // kabupaten, status, urutan
    expect(m.el.querySelector(".reset")).toBeNull();

    const sort = m.el.querySelectorAll("select")[2];
    setValue(sort, "aman", "change");
    expect(spotsMod.sortBy.value).toBe("aman");
  });

  test("klik kartu membuka detail pantai", () => {
    const m = show(SpotsView, { mode: "list" });
    m.el.querySelector(".title-link").click();
    expect(window.location.pathname).toBe("/pantai/1");
    expect(route.name).toBe("detail");
  });

  test("mengubah filter memperbarui state bersama dan memuat ulang; reset filter tersedia", async () => {
    const m = show(SpotsView, { mode: "list" });
    setValue(m.el.querySelector("input[type=search]"), "alpha");
    await flush(3);
    expect(spotsMod.filters.q).toBe("alpha");
    expect(api.getSpots).toHaveBeenCalled();
    await nextTick();
    const reset = m.el.querySelector(".reset");
    expect(reset).not.toBeNull();
    reset.click();
    await flush(2);
    expect(spotsMod.filters.q).toBe("");
  });

  test("memuat dengan data kosong menampilkan kerangka; memuat dengan data menampilkan 'Memuat…'", async () => {
    spotsMod.spots.value = [];
    spotsMod.loading.value = true;
    const m = show(SpotsView, { mode: "list" });
    expect(m.el.querySelectorAll(".skeleton")).toHaveLength(6);
    expect(m.el.querySelector(".count").textContent).toContain("Memuat…");
  });

  test("kosong karena error API", () => {
    spotsMod.spots.value = [];
    spotsMod.apiError.value = { kind: "network", message: "x", hint: "" };
    const m = show(SpotsView, { mode: "list" });
    expect(m.el.querySelector(".empty").textContent).toContain("Data pantai belum dapat dimuat.");
  });

  test("kosong karena filter: ada tombol reset di dalam kartu", async () => {
    spotsMod.spots.value = [];
    spotsMod.filters.status = "BAHAYA";
    await flush(2);
    spotsMod.spots.value = [];
    const m = show(SpotsView, { mode: "list" });
    expect(m.el.querySelector(".empty").textContent).toContain("Tidak ada pantai yang cocok.");
    m.el.querySelector(".empty button").click();
    await flush(2);
    expect(spotsMod.filters.status).toBe("");
  });

  test("kosong tanpa filter aktif tidak menampilkan tombol reset", () => {
    spotsMod.spots.value = [];
    const m = show(SpotsView, { mode: "list" });
    expect(m.el.querySelector(".empty button")).toBeNull();
  });

  test("mode peta: judul, tanpa pilihan urutan, dan klik penanda membuka detail", () => {
    const m = show(SpotsView, { mode: "map" });
    expect(m.el.querySelector("h1").textContent).toBe("Peta Status Pantai");
    expect(m.el.querySelectorAll("select")).toHaveLength(2);
    expect(m.el.querySelector(".map-stub")).not.toBeNull();
    m.el.querySelector(".pick").click();
    expect(window.location.pathname).toBe("/pantai/5");
  });
});

describe("HomeView", () => {
  test("merakit semua section dan menghitung ringkasan", () => {
    const m = show(HomeView);
    expect(m.el.querySelector(".hero")).not.toBeNull();
    expect(m.el.querySelectorAll(".wcard")).toHaveLength(2);
    const stats = [...m.el.querySelectorAll(".stats .stat strong")].map((s) => s.textContent);
    expect(stats).toEqual(["2", "2", "1", "1"]);
    expect(m.el.textContent).toContain("Tentang TobaWaterSafe");
    expect(m.el.querySelectorAll(".edu .col")).toHaveLength(4);
  });

  test("tombol jelajah menggulir ke Sorotan Pantai", () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const m = show(HomeView);
    m.el.querySelector(".hero button").click();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  test("kolom edukasi membuka daftar dengan filter yang sesuai", async () => {
    spotsMod.filters.q = "sisa";
    const m = show(HomeView);
    m.el.querySelectorAll(".edu button")[0].click(); // Lihat pantai aman
    expect(spotsMod.filters.status).toBe("AMAN");
    expect(spotsMod.filters.q).toBe("");
    expect(window.location.pathname).toBe("/daftar");

    m.el.querySelectorAll(".edu button")[2].click(); // Buka peta status (tanpa filter)
    expect(spotsMod.filters.status).toBe("");
    expect(window.location.pathname).toBe("/peta");
    await flush(2);
  });

  test("saat data kosong dan error, sorotan menampilkan pesan", () => {
    spotsMod.allSpots.value = [];
    spotsMod.apiError.value = { kind: "http", message: "x", hint: "" };
    const m = show(HomeView);
    expect(m.el.textContent).toContain("Data belum tersedia");
    expect(m.el.textContent).toContain("belum dapat dimuat");
  });
});

describe("AdminView", () => {
  test("halaman ringkasan menampilkan nama petugas dan tab aktif", () => {
    const m = show(AdminView, { page: "admin" });
    expect(m.el.textContent).toContain("Masuk sebagai Budi");
    expect(m.el.querySelector(".stats")).not.toBeNull();
    expect(m.el.querySelector(".tabs a.on").textContent).toBe("Ringkasan");
    expect(m.el.querySelectorAll(".tabs a")).toHaveLength(4);
  });

  test("tanpa prop page memakai halaman ringkasan; user kosong tidak error", () => {
    auth.user = null;
    const m = show(AdminView);
    expect(m.el.querySelector(".stats")).not.toBeNull();
    expect(m.el.textContent).toContain("Masuk sebagai");
  });

  describe("kelola pantai", () => {
    test("daftar, pencarian, dan keadaan kosong", async () => {
      const m = show(AdminView, { page: "admin-spots" });
      expect(m.el.querySelectorAll("tbody tr")).toHaveLength(2);
      setValue(m.el.querySelector(".find"), "bravo");
      await nextTick();
      expect(m.el.querySelectorAll("tbody tr")).toHaveLength(1);
      setValue(m.el.querySelector(".find"), "tidak-ada");
      await nextTick();
      expect(m.el.textContent).toContain("Tidak ada pantai yang cocok.");
    });

    test("ubah pantai: formulir terisi, simpan berhasil menutup formulir dan menampilkan notifikasi", async () => {
      api.updateSpot.mockResolvedValue({});
      const m = show(AdminView, { page: "admin-spots" });
      m.el.querySelector("button.ghost").click();
      await nextTick();
      expect(m.el.querySelector("form h2").textContent).toBe("Ubah Data Pantai");
      m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
      await flush();
      expect(api.updateSpot).toHaveBeenCalledWith(1, expect.objectContaining({ nama_pantai: "Alpha" }));
      expect(m.el.querySelector("form")).toBeNull();
      expect(m.el.querySelector(".notice.ok").textContent).toContain("berhasil diperbarui");
    });

    test("ubah pantai gagal: formulir tetap terbuka dan pesan error tampil", async () => {
      api.updateSpot.mockRejectedValue({ response: { status: 400, data: { error: "Nama sudah dipakai" } } });
      const m = show(AdminView, { page: "admin-spots" });
      m.el.querySelector("button.ghost").click();
      await nextTick();
      m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
      await flush();
      expect(m.el.querySelector("form")).not.toBeNull();
      expect(m.el.querySelector(".notice.err").textContent).toBe("Nama sudah dipakai");
    });

    test("batal ubah menutup formulir; berpindah halaman juga menutupnya", async () => {
      const m = show(AdminView, { page: "admin-spots" });
      m.el.querySelector("button.ghost").click();
      await nextTick();
      m.el.querySelector("form button.ghost").click();
      await nextTick();
      expect(m.el.querySelector("form")).toBeNull();

      m.el.querySelector("button.ghost").click();
      await nextTick();
      expect(m.el.querySelector("form")).not.toBeNull();
      m.props.page = "admin";
      await nextTick();
      m.props.page = "admin-spots";
      await nextTick();
      expect(m.el.querySelector("form")).toBeNull();
    });

    test("hapus pantai: dibatalkan bila tidak dikonfirmasi, dijalankan bila dikonfirmasi", async () => {
      api.deleteSpot.mockResolvedValue({});
      const m = show(AdminView, { page: "admin-spots" });

      globalThis.confirm = vi.fn(() => false);
      m.el.querySelector("button.danger").click();
      await flush();
      expect(api.deleteSpot).not.toHaveBeenCalled();

      globalThis.confirm = vi.fn(() => true);
      m.el.querySelector("button.danger").click();
      await flush();
      expect(globalThis.confirm).toHaveBeenCalledWith(expect.stringContaining("Alpha"));
      expect(api.deleteSpot).toHaveBeenCalledWith(1);
      expect(m.el.querySelector(".notice.ok").textContent).toContain("Alpha dihapus.");
    });
  });

  describe("tambah pantai", () => {
    test("simpan berhasil kembali ke daftar pantai", async () => {
      api.createSpot.mockResolvedValue({});
      const m = show(AdminView, { page: "admin-spot-new" });
      expect(m.el.querySelector("form h2").textContent).toBe("Tambah Data Pantai");
      m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
      await flush();
      expect(api.createSpot).toHaveBeenCalled();
      expect(window.location.pathname).toBe("/petugas/pantai");
    });

    test("simpan gagal tetap di halaman tambah", async () => {
      api.createSpot.mockRejectedValue(new Error("x"));
      const m = show(AdminView, { page: "admin-spot-new" });
      go("/petugas/pantai/tambah", { replace: true });
      m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
      await flush();
      expect(window.location.pathname).toBe("/petugas/pantai/tambah");
      expect(m.el.querySelector(".notice.err")).not.toBeNull();
    });

    test("batal kembali ke daftar pantai", () => {
      const m = show(AdminView, { page: "admin-spot-new" });
      m.el.querySelector("form button.ghost").click();
      expect(window.location.pathname).toBe("/petugas/pantai");
    });
  });

  describe("catat kondisi", () => {
    test("tombol Catat membuka dialog; simpan menutup dialog dan menampilkan notifikasi", async () => {
      api.addCondition.mockResolvedValue({ current_status: "WASPADA" });
      const m = show(AdminView, { page: "admin-log" });
      expect(m.el.querySelector("dialog")).toBeNull();
      m.el.querySelectorAll("tbody button")[1].click();
      await nextTick();
      expect(m.el.querySelector("dialog")).not.toBeNull();
      expect(m.el.querySelector("dialog select").value).toBe("2");

      m.el.querySelector("dialog form").dispatchEvent(new Event("submit", { cancelable: true }));
      await flush();
      expect(api.addCondition).toHaveBeenCalled();
      expect(m.el.querySelector("dialog")).toBeNull();
      expect(m.el.querySelector(".notice.ok").textContent).toContain("Laporan Bravo tersimpan. Status sekarang: WASPADA.");
    });

    test("tombol Batal menutup dialog", async () => {
      const m = show(AdminView, { page: "admin-log" });
      m.el.querySelectorAll("tbody button")[0].click();
      await nextTick();
      m.el.querySelector("dialog button.ghost").click();
      await nextTick();
      expect(m.el.querySelector("dialog")).toBeNull();
    });

    test("alamat ?spot=ID langsung membuka dialog untuk pantai itu", async () => {
      go("/petugas/kondisi?spot=2", { replace: true });
      const m = show(AdminView, { page: "admin-log" });
      await flush(2);
      expect(m.el.querySelector("dialog")).not.toBeNull();
      expect(m.el.querySelector("dialog select").value).toBe("2");
    });
  });
});