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
vi.mock("../src/composables/useAuth", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

import { getSpot, addCondition } from "../src/services/spotApi";
import { login, register } from "../src/composables/useAuth";
import { route } from "../src/composables/useRoute";
import SpotDetail from "../src/components/spots/SpotDetail.vue";
import AdminLogModal from "../src/components/admin/AdminLogModal.vue";
import LoginPanel from "../src/components/auth/LoginPanel.vue";

let current;
const show = (component, props) => (current = mount(component, props));

beforeEach(() => {
  vi.clearAllMocks();
  HTMLDialogElement.prototype.showModal = vi.fn();
});

afterEach(() => {
  current?.unmount();
  current = null;
});

const setValue = (el, value, type = "input") => {
  el.value = value;
  el.dispatchEvent(new Event(type, { bubbles: true }));
};

const detailFixture = (over = {}) =>
  spotFixture({
    id: 3,
    current_status: "WASPADA",
    history: [
      { id: 2, kondisi_eceng_gondok: "Sedang", tinggi_ombak: "Tenang", catatan_petugas: "Angin kencang", updated_at: "2026-04-10 10:00:00" },
      { id: 1, kondisi_eceng_gondok: "Bersih", tinggi_ombak: "Tenang", catatan_petugas: "", updated_at: "2026-04-09 10:00:00" },
    ],
    ...over,
  });

describe("SpotDetail", () => {
  test("menampilkan kerangka saat memuat lalu detail lengkap", async () => {
    getSpot.mockResolvedValue(detailFixture());
    const m = show(SpotDetail, { spotId: 3 });
    expect(m.el.querySelector(".skeleton")).not.toBeNull();
    await flush();
    expect(getSpot).toHaveBeenCalledWith(3);
    expect(m.el.querySelector("h2").textContent).toBe("Pantai Parbaba");
    expect(m.el.querySelector(".advice").classList.contains("waspada")).toBe(true);
    expect(m.el.textContent).toContain("Landai (ramah anak)");
    expect(m.el.textContent).toContain("Tersedia");
    expect(m.el.textContent).toContain("“Angin kencang”");
    expect(m.el.textContent).toContain("WIB");
    expect(m.el.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(m.el.querySelectorAll("tbody tr")[1].textContent).toContain("-");
    expect(m.el.querySelector(".maplink").getAttribute("href")).toContain("query=2.6,98.7");
  });

  test("tanpa koordinat, tanpa riwayat, kedalaman kosong", async () => {
    getSpot.mockResolvedValue(
      detailFixture({ latitude: null, longitude: null, history: [], kedalaman_avg: null, is_ramah_anak: 0, ada_pelampung: 0, current_status: null })
    );
    const m = show(SpotDetail, { spotId: 3 });
    await flush();
    expect(m.el.querySelector(".maplink")).toBeNull();
    expect(m.el.textContent).toContain("Belum ada laporan dari petugas untuk pantai ini.");
    expect(m.el.textContent).toContain("Belum ada laporan.");
    expect(m.el.textContent).toContain("Dalam / curam");
    expect(m.el.textContent).toContain("Tidak tersedia");
    expect(m.el.textContent).toContain("- m");
  });

  test("riwayat tidak ada sama sekali (undefined)", async () => {
    getSpot.mockResolvedValue(detailFixture({ history: undefined }));
    const m = show(SpotDetail, { spotId: 3 });
    await flush();
    expect(m.el.textContent).toContain("Belum ada laporan.");
  });

  test("koordinat bernilai 0 tidak menghasilkan tautan peta yang valid", async () => {
    getSpot.mockResolvedValue(detailFixture({ latitude: 0, longitude: 0 }));
    const m = show(SpotDetail, { spotId: 3 });
    await flush();
    expect(m.el.querySelector(".maplink").getAttribute("href")).toBe("#");
  });

  test("error: menampilkan pesan, petunjuk, dan bisa dicoba lagi", async () => {
    getSpot.mockRejectedValueOnce({ request: {} });
    const m = show(SpotDetail, { spotId: 3 });
    await flush();
    expect(m.el.querySelector(".error").textContent).toContain("Tidak dapat terhubung");
    expect(m.el.querySelector(".card .muted")).not.toBeNull();

    getSpot.mockResolvedValueOnce(detailFixture());
    const retry = [...m.el.querySelectorAll("button")].find((b) => b.textContent === "Coba lagi");
    retry.click();
    await flush();
    expect(m.el.querySelector("h2").textContent).toBe("Pantai Parbaba");
  });

  test("error tanpa petunjuk", async () => {
    getSpot.mockRejectedValueOnce(new Error("x"));
    const m = show(SpotDetail, { spotId: 3 });
    await flush();
    expect(m.el.querySelector(".error").textContent).toContain("Gagal memuat detail pantai.");
    expect(m.el.querySelector(".card .muted")).toBeNull();
  });

  test("mengganti spotId memuat ulang dan tombol kembali mengirim event", async () => {
    getSpot.mockResolvedValue(detailFixture());
    const onClose = vi.fn();
    const m = show(SpotDetail, { spotId: 3, onClose });
    await flush();
    m.props.spotId = 4;
    await flush();
    expect(getSpot).toHaveBeenLastCalledWith(4);
    m.el.querySelector(".back").click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("AdminLogModal", () => {
  const spots = [spotFixture({ id: 1, nama_pantai: "A" }), spotFixture({ id: 2, nama_pantai: "B" })];

  test("membuka dialog modal dan memilih pantai pertama secara bawaan", () => {
    const m = show(AdminLogModal, { spots });
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(m.el.querySelector("select").value).toBe("1");
    expect(m.el.querySelector(".preview").textContent).toContain("Aman Berenang");
  });

  test("memakai spotId dari props bila ada; tanpa pantai sama sekali tidak error", () => {
    const m = show(AdminLogModal, { spots, spotId: 2 });
    expect(m.el.querySelector("select").value).toBe("2");
    m.unmount();
    const empty = show(AdminLogModal, { spots: [] });
    expect(empty.el.querySelectorAll("select")[0].querySelectorAll("option")).toHaveLength(0);
  });

  test("pratinjau status mengikuti kondisi dan pilihan manual", async () => {
    const m = show(AdminLogModal, { spots });
    const [, eceng, ombak, status] = m.el.querySelectorAll("select");
    const preview = () => m.el.querySelector(".preview");

    setValue(eceng, "Sedang", "change");
    await nextTick();
    expect(preview().classList.contains("waspada")).toBe(true);
    expect(preview().textContent).toContain("Waspada");

    setValue(ombak, "Tinggi", "change");
    await nextTick();
    expect(preview().classList.contains("bahaya")).toBe(true);
    expect(status.querySelector("option").textContent).toContain("BAHAYA");

    setValue(status, "AMAN", "change");
    await nextTick();
    expect(preview().classList.contains("aman")).toBe(true);
    expect([...status.querySelectorAll("option")].some((o) => o.textContent.includes("tutup darurat"))).toBe(true);
  });

  test("simpan berhasil mengirim event saved dengan nama pantai dan status", async () => {
    addCondition.mockResolvedValue({ current_status: "WASPADA" });
    const onSaved = vi.fn();
    const m = show(AdminLogModal, { spots, spotId: 2, onSaved });
    setValue(m.el.querySelector("textarea"), "Angin kencang");
    m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
    await flush();
    expect(addCondition).toHaveBeenCalledWith(
      expect.objectContaining({ spot_id: 2, catatan_petugas: "Angin kencang", current_status: undefined })
    );
    expect(onSaved).toHaveBeenCalledWith({ spot: "B", status: "WASPADA" });
  });

  test("status manual ikut dikirim", async () => {
    addCondition.mockResolvedValue({ current_status: "BAHAYA" });
    const m = show(AdminLogModal, { spots });
    setValue(m.el.querySelectorAll("select")[3], "BAHAYA", "change");
    m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
    await flush();
    expect(addCondition).toHaveBeenCalledWith(expect.objectContaining({ current_status: "BAHAYA" }));
  });

  test("saat menyimpan tombol dinonaktifkan; gagal menampilkan pesan error", async () => {
    let reject;
    addCondition.mockImplementation(() => new Promise((_, rej) => { reject = rej; }));
    const m = show(AdminLogModal, { spots });
    m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
    await nextTick();
    const submit = m.el.querySelector("button[type=submit]");
    expect(submit.disabled).toBe(true);
    expect(submit.textContent).toBe("Menyimpan…");

    reject({ response: { status: 400, data: { error: "Catatan terlalu panjang" } } });
    await flush();
    expect(m.el.querySelector(".error").textContent).toBe("Catatan terlalu panjang");
    expect(m.el.querySelector("button[type=submit]").disabled).toBe(false);
  });

  test("menutup dialog lewat tombol Batal, klik latar, dan tombol Esc", () => {
    const onClose = vi.fn();
    const m = show(AdminLogModal, { spots, onClose });
    m.el.querySelector("button.ghost").click();
    expect(onClose).toHaveBeenCalledTimes(1);

    const dialog = m.el.querySelector("dialog");
    dialog.dispatchEvent(new Event("click", { bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(2);

    const cancel = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  test("tetap berjalan bila browser tidak mendukung showModal", () => {
    HTMLDialogElement.prototype.showModal = undefined;
    expect(() => show(AdminLogModal, { spots })).not.toThrow();
  });
});

describe("LoginPanel", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/auth/login");
  });

  const fillLogin = (m) => {
    setValue(m.el.querySelector("#username"), "budi");
    setValue(m.el.querySelector("#password"), "rahasia1");
  };
  const submit = (m) => m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));

  test("login berhasil mengarahkan ke panel petugas", async () => {
    login.mockResolvedValue();
    const m = show(LoginPanel, { mode: "login" });
    expect(m.el.querySelector("h1").textContent).toBe("Masuk sebagai Petugas");
    expect(m.el.querySelector("#nama")).toBeNull();
    expect(m.el.querySelector("#btn-submit").textContent.trim()).toBe("Masuk");
    expect(m.el.querySelector(".link").getAttribute("href")).toBe("/auth/register");
    fillLogin(m);
    submit(m);
    await flush();
    expect(login).toHaveBeenCalledWith("budi", "rahasia1");
    expect(window.location.pathname).toBe("/petugas");
    expect(route.name).toBe("admin");
  });

  test("login gagal menampilkan pesan dan petunjuk; tombol aktif lagi", async () => {
    login.mockRejectedValue({ request: {} });
    const m = show(LoginPanel, { mode: "login" });
    fillLogin(m);
    submit(m);
    await flush();
    expect(m.el.querySelector(".err").textContent).toContain("Tidak dapat terhubung ke server API.");
    expect(m.el.querySelector(".err small")).not.toBeNull();
    expect(m.el.querySelector("#btn-submit").disabled).toBe(false);
  });

  test("gagal tanpa petunjuk", async () => {
    login.mockRejectedValue({ response: { status: 401, data: { error: "Password salah" } } });
    const m = show(LoginPanel, { mode: "login" });
    fillLogin(m);
    submit(m);
    await flush();
    expect(m.el.querySelector(".err").textContent.trim()).toBe("Password salah");
    expect(m.el.querySelector(".err small")).toBeNull();
  });

  test("tombol menunjukkan status memproses selama permintaan berjalan", async () => {
    let done;
    login.mockImplementation(() => new Promise((r) => { done = r; }));
    const m = show(LoginPanel, { mode: "login" });
    fillLogin(m);
    submit(m);
    await nextTick();
    expect(m.el.querySelector("#btn-submit").textContent.trim()).toBe("Memproses…");
    expect(m.el.querySelector("#btn-submit").disabled).toBe(true);
    done();
    await flush();
  });

  test("mode daftar menampilkan kolom tambahan dan memanggil register", async () => {
    register.mockResolvedValue();
    const m = show(LoginPanel, { mode: "register" });
    expect(m.el.querySelector("h1").textContent).toBe("Daftar Akun Petugas");
    expect(m.el.querySelector("#btn-submit").textContent.trim()).toBe("Daftar");
    expect(m.el.querySelector(".link").getAttribute("href")).toBe("/auth/login");
    setValue(m.el.querySelector("#username"), "baru");
    setValue(m.el.querySelector("#nama"), "Nama Baru");
    setValue(m.el.querySelector("#password"), "rahasia1");
    setValue(m.el.querySelector("#kode-petugas"), "KODE");
    submit(m);
    await flush();
    expect(register).toHaveBeenCalledWith({ username: "baru", nama: "Nama Baru", password: "rahasia1", kode_petugas: "KODE" });
  });

  test("berpindah mode mengosongkan pesan error, password, dan kode", async () => {
    login.mockRejectedValue({ response: { status: 401, data: { error: "Salah" } } });
    const m = show(LoginPanel, { mode: "login" });
    fillLogin(m);
    submit(m);
    await flush();
    expect(m.el.querySelector(".err")).not.toBeNull();
    m.props.mode = "register";
    await nextTick();
    expect(m.el.querySelector(".err")).toBeNull();
    expect(m.el.querySelector("#password").value).toBe("");
    expect(m.el.querySelector("#username").value).toBe("budi");
  });
});