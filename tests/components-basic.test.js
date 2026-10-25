import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { flush, mount, spotFixture } from "./helpers";

vi.mock("../src/services/spotApi", () => ({
  getSpots: vi.fn().mockResolvedValue({ data: [] }),
  getSpot: vi.fn(),
  createSpot: vi.fn(),
  updateSpot: vi.fn(),
  deleteSpot: vi.fn(),
  addCondition: vi.fn(),
}));

import { getSpots } from "../src/services/spotApi";
import StatusBadge from "../src/components/common/StatusBadge.vue";
import LakeScene from "../src/components/common/LakeScene.vue";
import ApiAlert from "../src/components/common/ApiAlert.vue";
import Footer from "../src/components/layout/Footer.vue";
import Navbar from "../src/components/layout/Navbar.vue";
import NotFoundView from "../src/views/NotFoundView.vue";
import HeroSection from "../src/components/home/HeroSection.vue";
import AboutSection from "../src/components/home/AboutSection.vue";
import EducationSection from "../src/components/home/EducationSection.vue";
import StatsSection from "../src/components/home/StatsSection.vue";
import ShowcaseSection from "../src/components/home/ShowcaseSection.vue";
import FilterBar from "../src/components/spots/FilterBar.vue";
import SpotCard from "../src/components/spots/SpotCard.vue";
import SpotForm from "../src/components/spots/SpotForm.vue";
import AdminSummary from "../src/components/admin/AdminSummary.vue";
import AdminSpotTable from "../src/components/admin/AdminSpotTable.vue";
import AdminLogTable from "../src/components/admin/AdminLogTable.vue";
import { apiError, loading } from "../src/composables/useSpots";
import { EDUCATION_ITEMS } from "../src/data/education";

let current;
const show = (component, props) => (current = mount(component, props));

afterEach(() => {
  current?.unmount();
  current = null;
  apiError.value = null;
  loading.value = false;
});

const setValue = (el, value, type = "input") => {
  el.value = value;
  el.dispatchEvent(new Event(type, { bubbles: true }));
};

describe("StatusBadge", () => {
  test("menampilkan label dan ikon sesuai status", () => {
    const m = show(StatusBadge, { status: "BAHAYA" });
    expect(m.el.textContent).toContain("Bahaya / Tutup");
    expect(m.el.textContent).toContain("🔴");
    expect(m.el.querySelector(".badge-waspada")).toBeNull();
  });

  test("WASPADA memakai kelas khusus; status kosong atau asing jatuh ke AMAN", async () => {
    const m = show(StatusBadge, { status: "waspada" });
    expect(m.el.querySelector(".badge-waspada")).not.toBeNull();
    m.props.status = undefined;
    await nextTick();
    expect(m.el.textContent).toContain("Aman Berenang");
    m.props.status = "ASING";
    await nextTick();
    expect(m.el.textContent).toContain("Aman Berenang");
  });
});

describe("LakeScene", () => {
  test("setiap instance punya id gradien unik dan nada warna bisa diganti", async () => {
    const a = mount(LakeScene, { tone: "day" });
    const b = mount(LakeScene);
    const idA = a.el.querySelector("linearGradient").id;
    const idB = b.el.querySelector("linearGradient").id;
    expect(idA).not.toBe(idB);
    expect(a.el.querySelector("svg").getAttribute("aria-hidden")).toBe("true");
    a.props.tone = "tidak-ada"; // jatuh ke dusk
    await nextTick();
    expect(a.el.querySelector("stop").getAttribute("stop-color")).toBe("#0b3d5c");
    a.unmount();
    b.unmount();
  });
});

describe("Footer & NotFoundView", () => {
  test("footer menampilkan tautan dan daftar kawasan", () => {
    const m = show(Footer);
    expect(m.el.querySelectorAll(".chips li")).toHaveLength(7);
    expect([...m.el.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(
      expect.arrayContaining(["/beranda", "/daftar", "/peta", "/auth/login", "/auth/register"])
    );
    expect(m.el.textContent).toContain("2026 TobaWaterSafe");
  });

  test("halaman tidak ditemukan punya tautan ke beranda", () => {
    const m = show(NotFoundView);
    expect(m.el.querySelector("h1").textContent).toContain("tidak ditemukan");
    expect(m.el.querySelector("a").getAttribute("href")).toBe("/beranda");
  });
});

describe("Navbar", () => {
  const active = (m) => [...m.el.querySelectorAll(".links .item.on")].map((a) => a.textContent.trim());

  test("tanpa user: tombol Login Petugas dan menu aktif sesuai halaman", async () => {
    const m = show(Navbar, { current: "list", user: null });
    expect(active(m)).toEqual(["Daftar"]);
    const pill = m.el.querySelector(".pill");
    expect(pill.textContent.trim()).toBe("Login Petugas");
    expect(pill.getAttribute("href")).toBe("/auth/login");
    expect(m.el.querySelector(".who")).toBeNull();

    m.props.current = "detail";
    await nextTick();
    expect(active(m)).toEqual(["Daftar"]);

    m.props.current = "map";
    await nextTick();
    expect(active(m)).toEqual(["Peta"]);

    m.props.current = undefined;
    await nextTick();
    expect(active(m)).toEqual([]);
  });

  test("halaman petugas/login/register menandai tombol panel", async () => {
    const m = show(Navbar, { current: "admin-spots", user: null });
    expect(m.el.querySelector(".pill.on")).not.toBeNull();
    m.props.current = "login";
    await nextTick();
    expect(m.el.querySelector(".pill.on")).not.toBeNull();
    m.props.current = "register";
    await nextTick();
    expect(m.el.querySelector(".pill.on")).not.toBeNull();
    m.props.current = "home";
    await nextTick();
    expect(m.el.querySelector(".pill.on")).toBeNull();
  });

  test("dengan user: tampil nama, tombol Keluar, dan tautan Panel Petugas", () => {
    const onLogout = vi.fn();
    const m = show(Navbar, { current: "home", user: { nama: "Budi" }, onLogout });
    expect(m.el.querySelector(".who").textContent).toBe("Budi");
    const pill = m.el.querySelector(".pill");
    expect(pill.textContent.trim()).toBe("Panel Petugas");
    expect(pill.getAttribute("href")).toBe("/petugas");
    m.el.querySelector(".out").click();
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

describe("ApiAlert", () => {
  test("tidak tampil bila tidak ada error", () => {
    const m = show(ApiAlert);
    expect(m.el.querySelector(".alert")).toBeNull();
  });

  test("menampilkan pesan, petunjuk, tombol coba lagi dan tutup", async () => {
    apiError.value = { kind: "network", message: "Tidak dapat terhubung.", hint: "Periksa Back-End." };
    const m = show(ApiAlert);
    expect(m.el.textContent).toContain("Tidak dapat terhubung.");
    expect(m.el.querySelector("small").textContent).toBe("Periksa Back-End.");

    getSpots.mockClear();
    m.el.querySelector(".btns button").click();
    await flush(2);
    expect(getSpots).toHaveBeenCalled(); // berhasil memuat -> pesan error hilang sendiri
    expect(apiError.value).toBeNull();

    apiError.value = { kind: "http", message: "Error baru", hint: "" };
    await flush(3);
    m.el.querySelector(".x").click();
    expect(apiError.value).toBeNull();
    await flush(3);
    expect(m.el.querySelector(".alert")).toBeNull();
  });

  test("tanpa petunjuk dan saat loading tombol dinonaktifkan", async () => {
    apiError.value = { kind: "http", message: "Gagal", hint: "" };
    loading.value = true;
    const m = show(ApiAlert);
    expect(m.el.querySelector("small")).toBeNull();
    const retry = m.el.querySelector(".btns button");
    expect(retry.disabled).toBe(true);
    expect(retry.textContent).toBe("Mencoba…");
  });
});

describe("Section beranda", () => {
  test("HeroSection: tombol jelajah memicu event, tautan peta tersedia", () => {
    const onExplore = vi.fn();
    const m = show(HeroSection, { onExplore });
    m.el.querySelector("button").click();
    expect(onExplore).toHaveBeenCalledTimes(1);
    expect(m.el.querySelector("a").getAttribute("href")).toBe("/peta");
    expect(m.el.querySelector(".home-photo").getAttribute("style")).toContain("/images/hero.jpg");
  });

  test("AboutSection menampilkan teks dan tautan", () => {
    const m = show(AboutSection);
    expect(m.el.textContent).toContain("Tentang TobaWaterSafe");
    expect(m.el.querySelector("a").getAttribute("href")).toBe("/daftar");
    expect(m.el.querySelector(".home-photo").getAttribute("style")).toContain("tentang.jpg");
  });

  test("EducationSection: tiap tombol mengirim filter dan tujuan", () => {
    const onOpen = vi.fn();
    const m = show(EducationSection, { onOpen });
    const buttons = m.el.querySelectorAll("button");
    expect(buttons).toHaveLength(EDUCATION_ITEMS.length);
    buttons[1].click();
    expect(onOpen).toHaveBeenCalledWith(EDUCATION_ITEMS[1].patch, EDUCATION_ITEMS[1].path);
  });

  test("StatsSection menampilkan empat angka ringkasan", () => {
    const m = show(StatsSection, {
      summary: { total: 8, kabupaten: 3, byStatus: { AMAN: 5, WASPADA: 2, BAHAYA: 1 }, needAttention: 3 },
    });
    expect([...m.el.querySelectorAll("strong")].map((s) => s.textContent)).toEqual(["8", "3", "5", "3"]);
  });

  test("ShowcaseSection menampilkan kartu pantai dan tombol geser", () => {
    const spots = [
      spotFixture({ id: 1, current_status: "AMAN" }),
      spotFixture({ id: 2, nama_pantai: "Pantai B", current_status: "BAHAYA", is_ramah_anak: 0, ada_pelampung: 0, kondisi_eceng_gondok: null, tinggi_ombak: null }),
    ];
    const m = show(ShowcaseSection, { spots, loading: false, hasError: false });
    const cards = m.el.querySelectorAll(".wcard");
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain("Ramah anak");
    expect(cards[0].textContent).toContain("Ada pelampung");
    expect(cards[1].textContent).toContain("Kontur lebih dalam");
    expect(cards[1].textContent).toContain("Tanpa pelampung");
    expect(cards[1].textContent).toContain("belum ada laporan");
    expect(cards[1].querySelector("a").getAttribute("href")).toBe("/pantai/2");

    const scrollBy = vi.fn();
    m.el.querySelector(".track").scrollBy = scrollBy;
    const [prev, next] = m.el.querySelectorAll(".arrows button");
    prev.click();
    next.click();
    expect(scrollBy).toHaveBeenNthCalledWith(1, { left: -300, behavior: "smooth" });
    expect(scrollBy).toHaveBeenNthCalledWith(2, { left: 300, behavior: "smooth" });
  });

  test("ShowcaseSection tanpa data: pesan memuat / belum tersedia / gagal", async () => {
    const m = show(ShowcaseSection, { spots: [], loading: true, hasError: false });
    expect(m.el.textContent).toContain("Memuat data…");
    expect(m.el.textContent).toContain("Data pantai sedang dimuat.");
    m.props.loading = false;
    m.props.hasError = true;
    await nextTick();
    expect(m.el.textContent).toContain("Data belum tersedia");
    expect(m.el.textContent).toContain("Coba lagi");
  });
});

describe("FilterBar", () => {
  const base = { q: "", kabupaten: "", status: "", ada_pelampung: false, ramah_anak: false };

  test("setiap kontrol mengirim nilai filter baru", () => {
    const onUpdate = vi.fn();
    const onSort = vi.fn();
    const m = show(FilterBar, {
      modelValue: base, kabupatenList: ["Karo", "Toba"], sort: "nama",
      "onUpdate:modelValue": onUpdate, "onUpdate:sort": onSort,
    });
    setValue(m.el.querySelector("input[type=search]"), "parba");
    expect(onUpdate).toHaveBeenLastCalledWith({ ...base, q: "parba" });

    const [kab, status, sort] = m.el.querySelectorAll("select");
    expect(kab.querySelectorAll("option")).toHaveLength(3);
    setValue(kab, "Toba", "change");
    expect(onUpdate).toHaveBeenLastCalledWith({ ...base, kabupaten: "Toba" });
    setValue(status, "AMAN", "change");
    expect(onUpdate).toHaveBeenLastCalledWith({ ...base, status: "AMAN" });
    setValue(sort, "aman", "change");
    expect(onSort).toHaveBeenCalledWith("aman");

    const [pelampung, ramah] = m.el.querySelectorAll("input[type=checkbox]");
    pelampung.checked = true;
    pelampung.dispatchEvent(new Event("change", { bubbles: true }));
    expect(onUpdate).toHaveBeenLastCalledWith({ ...base, ada_pelampung: true });
    ramah.checked = true;
    ramah.dispatchEvent(new Event("change", { bubbles: true }));
    expect(onUpdate).toHaveBeenLastCalledWith({ ...base, ramah_anak: true });
  });

  test("tanpa prop sort, pilihan urutan disembunyikan", () => {
    const m = show(FilterBar, { modelValue: base, kabupatenList: [] });
    expect(m.el.querySelectorAll("select")).toHaveLength(2);
  });
});

describe("SpotCard", () => {
  test("pantai dengan laporan: kondisi, foto, dan klik judul memilih pantai", () => {
    const onSelect = vi.fn();
    const spot = spotFixture({ id: 4, nama_pantai: "Pantai Pasir Putih Parbaba", kondisi_updated_at: "2026-01-01 10:00:00" });
    const m = show(SpotCard, { spot, onSelect });
    expect(m.el.querySelector("img").getAttribute("src")).toBe("/photos/parbaba.jpg");
    expect(m.el.textContent).toContain("Eceng gondok:");
    expect(m.el.textContent).toContain("Diperbarui");
    expect(m.el.textContent).toContain("Ramah anak");
    expect(m.el.textContent).toContain("Ada pelampung");
    m.el.querySelector(".title-link").click();
    expect(onSelect).toHaveBeenCalledWith(4);
  });

  test("foto yang gagal dimuat disembunyikan", async () => {
    const spot = spotFixture({ nama_pantai: "Pantai Lumban Silintong" });
    const m = show(SpotCard, { spot });
    const img = m.el.querySelector("img");
    img.dispatchEvent(new Event("error"));
    await nextTick();
    expect(m.el.querySelector("img")).toBeNull();
  });

  test("pantai tanpa foto, tanpa laporan, tanpa fasilitas", () => {
    const spot = spotFixture({ nama_pantai: "Tidak Ada Foto", is_ramah_anak: 0, ada_pelampung: 0, kedalaman_avg: null, current_status: "WASPADA" });
    const m = show(SpotCard, { spot });
    expect(m.el.querySelector("img")).toBeNull();
    expect(m.el.textContent).toContain("Belum ada laporan harian.");
    expect(m.el.textContent).toContain("Kurang cocok untuk anak");
    expect(m.el.textContent).toContain("Tanpa pelampung");
    expect(m.el.textContent).toContain("- m");
    expect(m.el.querySelector("article").classList.contains("waspada")).toBe(true);
  });
});

describe("SpotForm", () => {
  test("mode tambah: nilai awal kosong dan payload dikirim saat simpan", async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const m = show(SpotForm, { onSave, onCancel });
    expect(m.el.querySelector("h2").textContent).toBe("Tambah Data Pantai");

    const inputs = m.el.querySelectorAll("input");
    setValue(inputs[0], "Pantai Baru");
    setValue(inputs[1], "Toba");
    setValue(inputs[2], "2.5");
    setValue(inputs[3], "2.6");
    setValue(inputs[4], "98.7");
    inputs[5].checked = true;
    inputs[5].dispatchEvent(new Event("change", { bubbles: true }));
    m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      nama_pantai: "Pantai Baru", kabupaten: "Toba", kedalaman_avg: 2.5, latitude: 2.6, longitude: 98.7,
      is_ramah_anak: 1, ada_pelampung: 0, current_status: "AMAN",
    });

    m.el.querySelector("button.ghost").click();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("mode ubah: terisi dari data pantai", () => {
    const spot = spotFixture({ nama_pantai: "Parbaba", kabupaten: "Samosir", kedalaman_avg: 1.2, current_status: "BAHAYA", latitude: 2.1, longitude: 98.1 });
    const m = show(SpotForm, { spot });
    expect(m.el.querySelector("h2").textContent).toBe("Ubah Data Pantai");
    const inputs = m.el.querySelectorAll("input");
    expect(inputs[0].value).toBe("Parbaba");
    expect(inputs[1].value).toBe("Samosir");
    expect(m.el.querySelector("select").value).toBe("BAHAYA");
    expect(inputs[5].checked).toBe(true);
    expect(inputs[6].checked).toBe(true);
  });
});

describe("Komponen admin", () => {
  test("AdminSummary: kartu angka, tautan, dan laporan terbaru", () => {
    const spots = [
      spotFixture({ id: 1, current_status: "AMAN", kondisi_updated_at: new Date().toISOString() }),
      spotFixture({ id: 2, nama_pantai: "B", current_status: "BAHAYA", kondisi_updated_at: "2026-01-01 00:00:00" }),
      spotFixture({ id: 3, nama_pantai: "C", current_status: "WASPADA" }),
    ];
    const m = show(AdminSummary, { spots });
    const values = [...m.el.querySelectorAll(".stat b")].map((b) => b.textContent);
    expect(values).toEqual(["3", "1", "1", "1", "2"]);
    expect(m.el.querySelectorAll(".recent li")).toHaveLength(2);
    expect(m.el.querySelector(".recent a").getAttribute("href")).toBe("/pantai/1");
    expect([...m.el.querySelectorAll(".actions a")].map((a) => a.getAttribute("href"))).toEqual([
      "/petugas/kondisi", "/petugas/pantai/tambah", "/petugas/pantai",
    ]);
  });

  test("AdminSummary tanpa laporan", () => {
    const m = show(AdminSummary, { spots: [spotFixture()] });
    expect(m.el.textContent).toContain("Belum ada laporan.");
  });

  test("AdminSpotTable: baris, tombol ubah/hapus, dan keadaan kosong", async () => {
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    const spots = [
      spotFixture({ id: 1, kondisi_updated_at: "2026-01-01 10:00:00" }),
      spotFixture({ id: 2, nama_pantai: "B" }),
    ];
    const m = show(AdminSpotTable, { spots, onEdit, onRemove });
    const rows = m.el.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain("Bersih");
    expect(rows[1].textContent).toContain("Belum ada");
    expect(rows[0].querySelector("a").getAttribute("href")).toBe("/petugas/kondisi?spot=1");
    rows[0].querySelector("button.ghost").click();
    rows[0].querySelector("button.danger").click();
    expect(onEdit).toHaveBeenCalledWith(spots[0]);
    expect(onRemove).toHaveBeenCalledWith(spots[0]);

    m.props.spots = [];
    await nextTick();
    expect(m.el.textContent).toContain("Tidak ada pantai yang cocok.");
  });

  test("AdminLogTable: status laporan hari ini, tombol catat, dan keadaan kosong", async () => {
    const onLog = vi.fn();
    const spots = [
      spotFixture({ id: 1, kondisi_updated_at: new Date().toISOString() }),
      spotFixture({ id: 2, nama_pantai: "B", kondisi_updated_at: "2026-01-01 10:00:00" }),
      spotFixture({ id: 3, nama_pantai: "C" }),
    ];
    const m = show(AdminLogTable, { spots, onLog });
    const flags = [...m.el.querySelectorAll(".flag")].map((f) => f.textContent.trim());
    expect(flags).toEqual(["Sudah", "Belum", "Belum"]);
    expect(m.el.textContent).toContain("Belum ada");
    m.el.querySelectorAll("button")[2].click();
    expect(onLog).toHaveBeenCalledWith(3);

    m.props.spots = [];
    await nextTick();
    expect(m.el.textContent).toContain("Belum ada data pantai.");
  });
});