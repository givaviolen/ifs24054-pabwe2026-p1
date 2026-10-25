import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { flush, mount, spotFixture } from "./helpers";

vi.mock("../src/services/spotApi", () => ({
  getSpots: vi.fn(),
  getSpot: vi.fn(),
  createSpot: vi.fn(),
  updateSpot: vi.fn(),
  deleteSpot: vi.fn(),
  addCondition: vi.fn(),
}));
vi.mock("../src/services/authApi", () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  meRequest: vi.fn(),
  logoutRequest: vi.fn(),
}));

import * as api from "../src/services/spotApi";
import * as authApi from "../src/services/authApi";
import { auth } from "../src/composables/useAuth";
import { go } from "../src/composables/useRoute";
import { setToken } from "../src/services/tokenStorage";
import * as spotsMod from "../src/composables/useSpots";
import App from "../src/App.vue";

const SPOTS = [spotFixture({ id: 1, nama_pantai: "Alpha" }), spotFixture({ id: 2, nama_pantai: "Bravo", current_status: "WASPADA" })];

let current;
const open = async (path, token = false) => {
  if (token) setToken("tok");
  go(path, { replace: true });
  current = mount(App);
  await flush(8);
  return current;
};

beforeEach(async () => {
  vi.clearAllMocks();
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = vi.fn();
  api.getSpots.mockResolvedValue({ data: SPOTS });
  api.getSpot.mockResolvedValue({ ...SPOTS[0], history: [] });
  authApi.meRequest.mockResolvedValue({ id: 1, nama: "Budi" });
  authApi.logoutRequest.mockResolvedValue({});
  auth.user = null;
  auth.ready = false;
  spotsMod.resetFilters();
  await flush(2);
});

afterEach(() => {
  current?.unmount();
  current = null;
  go("/beranda", { replace: true });
});

describe("App", () => {
  test("beranda: menampilkan hero dan memuat data pantai", async () => {
    const m = await open("/beranda");
    expect(m.el.querySelector(".hero")).not.toBeNull();
    expect(m.el.querySelector("main")).toBeNull();
    expect(m.el.querySelector("footer")).not.toBeNull();
    expect(m.el.querySelectorAll(".wcard").length).toBe(2);
    expect(api.getSpots).toHaveBeenCalled();
    expect(auth.ready).toBe(true);
  });

  test("daftar pantai", async () => {
    const m = await open("/daftar");
    expect(m.el.querySelector("main h1").textContent).toBe("Daftar Pantai");
    expect(m.el.querySelectorAll("article.spot")).toHaveLength(2);
  });

  test("detail pantai dan tombol kembali ke daftar", async () => {
    const m = await open("/pantai/1");
    expect(api.getSpot).toHaveBeenCalledWith(1);
    expect(m.el.querySelector("h2").textContent).toBe("Alpha");
    m.el.querySelector(".back").click();
    await flush(2);
    expect(window.location.pathname).toBe("/daftar");
    expect(m.el.querySelector("main h1").textContent).toBe("Daftar Pantai");
  });

  test("halaman login tampil setelah sesi diperiksa", async () => {
    const m = await open("/auth/login");
    expect(m.el.querySelector(".auth h1").textContent).toBe("Masuk sebagai Petugas");
  });

  test("halaman register", async () => {
    const m = await open("/auth/register");
    expect(m.el.querySelector(".auth h1").textContent).toBe("Daftar Akun Petugas");
  });

  test("halaman petugas tanpa login dialihkan ke login", async () => {
    const m = await open("/petugas");
    expect(window.location.pathname).toBe("/auth/login");
    expect(m.el.querySelector(".auth")).not.toBeNull();
  });

  test("halaman petugas dengan token yang berlaku menampilkan panel", async () => {
    const m = await open("/petugas", true);
    expect(authApi.meRequest).toHaveBeenCalled();
    expect(m.el.querySelector("main h1").textContent).toBe("Panel Petugas");
    expect(m.el.textContent).toContain("Masuk sebagai Budi");
  });

  test("pengguna yang sudah login dialihkan dari halaman login ke panel", async () => {
    const m = await open("/auth/login", true);
    expect(window.location.pathname).toBe("/petugas");
    expect(m.el.querySelector("main h1").textContent).toBe("Panel Petugas");
  });

  test("tombol Keluar mengakhiri sesi dan kembali ke beranda", async () => {
    const m = await open("/petugas", true);
    m.el.querySelector(".out").click();
    await flush(6);
    expect(authApi.logoutRequest).toHaveBeenCalled();
    expect(auth.user).toBeNull();
    expect(window.location.pathname).toBe("/beranda");
    expect(m.el.querySelector(".hero")).not.toBeNull();
  });

  test("alamat tidak dikenal menampilkan halaman tidak ditemukan", async () => {
    const m = await open("/tidak-ada");
    expect(m.el.querySelector("main h1").textContent).toBe("Halaman tidak ditemukan");
  });

  test("selama sesi belum diperiksa tampil pesan memeriksa sesi", async () => {
    authApi.meRequest.mockImplementation(() => new Promise(() => {}));
    const m = await open("/petugas", true);
    expect(m.el.textContent).toContain("Memeriksa sesi…");
  });
});