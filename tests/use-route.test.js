import { describe, test, expect, vi, beforeAll, beforeEach } from "vitest";
import { nextTick } from "vue";

let mod;
let guardMod;
let authMod;

beforeAll(async () => {
  window.scrollTo = vi.fn();
  // Bookmark lama bergaya "#/peta" harus dialihkan ke "/peta" saat modul dimuat.
  window.history.replaceState(null, "", "/");
  window.location.hash = "#/peta";
  mod = await import("../src/composables/useRoute");
  guardMod = await import("../src/composables/useRouteGuard");
  authMod = await import("../src/composables/useAuth");
  // Cegah happy-dom benar-benar berpindah halaman saat <a> diklik (listener ini berjalan setelah milik modul).
  document.addEventListener("click", (e) => e.preventDefault());
});

beforeEach(() => {
  window.scrollTo.mockClear();
});

const click = (anchor, init = {}) => {
  const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  anchor.dispatchEvent(ev);
  return ev;
};
const link = (attrs) => {
  const a = document.createElement("a");
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
  document.body.appendChild(a);
  return a;
};

describe("useRoute", () => {
  test("tautan lama #/peta dialihkan ke /peta", () => {
    expect(window.location.pathname).toBe("/peta");
    expect(mod.route.name).toBe("map");
    expect(mod.backPath()).toBe("/peta");
  });

  test("go berpindah halaman, memperbarui route dan mengingat tujuan Kembali", () => {
    mod.go("/daftar");
    expect(window.location.pathname).toBe("/daftar");
    expect(mod.route.name).toBe("list");
    expect(mod.backPath()).toBe("/daftar");

    mod.go("/pantai/12");
    expect(mod.route).toMatchObject({ name: "detail", id: 12 });
    expect(mod.backPath()).toBe("/daftar"); // detail tidak mengubah tujuan Kembali

    mod.go("/peta");
    expect(mod.backPath()).toBe("/peta");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test("go membaca query dan mendukung replace", () => {
    mod.go("/petugas/kondisi?spot=5", { replace: true });
    expect(mod.route.name).toBe("admin-log");
    expect(mod.route.query).toEqual({ spot: "5" });
  });

  test("go ke alamat yang sama tidak menambah riwayat", () => {
    mod.go("/daftar");
    const push = vi.spyOn(window.history, "pushState");
    mod.go("/daftar");
    expect(push).not.toHaveBeenCalled();
    push.mockRestore();
  });

  test("tombol Back (popstate) menyinkronkan route", () => {
    window.history.pushState(null, "", "/beranda");
    window.dispatchEvent(new Event("popstate"));
    expect(mod.route.name).toBe("home");
  });

  test("klik <a href='/...'> berpindah halaman tanpa memuat ulang", () => {
    const a = link({ href: "/daftar" });
    const ev = click(a);
    expect(ev.defaultPrevented).toBe(true);
    expect(mod.route.name).toBe("list");
  });

  test("klik <a href='#/peta'> juga ditangani", () => {
    mod.go("/beranda");
    const a = link({ href: "#/peta" });
    click(a);
    expect(mod.route.name).toBe("map");
  });

  test("klik elemen di dalam tautan tetap ditangani", () => {
    mod.go("/beranda");
    const a = link({ href: "/daftar" });
    const span = document.createElement("span");
    a.appendChild(span);
    click(span);
    expect(mod.route.name).toBe("list");
  });

  test("klik dengan tombol pengubah, tombol non-kiri, atau sudah dibatalkan diabaikan", () => {
    mod.go("/beranda");
    const a = link({ href: "/daftar" });
    click(a, { ctrlKey: true });
    click(a, { metaKey: true });
    click(a, { shiftKey: true });
    click(a, { altKey: true });
    click(a, { button: 1 });
    expect(mod.route.name).toBe("home");

    const b = link({ href: "/daftar" });
    b.addEventListener("click", (e) => e.preventDefault());
    click(b);
    expect(mod.route.name).toBe("home");
  });

  test("tautan yang bukan rute internal dibiarkan", () => {
    mod.go("/beranda");
    for (const attrs of [
      { href: "/daftar", target: "_blank" },
      { href: "/daftar", download: "" },
      { href: "" },
      { href: "https://example.com/daftar" },
      { href: "//example.com/daftar" },
      { href: "#bagian" },
    ]) {
      click(link(attrs));
    }
    expect(mod.route.name).toBe("home");
  });

  test("klik di luar tautan atau target tanpa closest diabaikan", () => {
    mod.go("/beranda");
    click(document.body);
    document.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
    expect(mod.route.name).toBe("home");
  });
});

describe("useRouteGuard", () => {
  test("belum login: halaman petugas dialihkan ke login", async () => {
    const { auth } = authMod;
    mod.go("/beranda");
    auth.user = null;
    auth.ready = true;
    const g = guardMod.useRouteGuard();
    expect(g.isProtected.value).toBe(false);
    mod.go("/petugas", { replace: true });
    await nextTick();
    expect(mod.route.name).toBe("login");
    expect(g.isAuthPage.value).toBe(true);
    expect(g.isProtected.value).toBe(false);
  });

  test("sudah login: halaman login dialihkan ke panel petugas", async () => {
    const { auth } = authMod;
    auth.ready = true;
    auth.user = { id: 1, nama: "Budi" };
    mod.go("/auth/register", { replace: true });
    await nextTick();
    expect(mod.route.name).toBe("admin");
  });

  test("sebelum sesi diperiksa, tidak ada pengalihan", async () => {
    const { auth } = authMod;
    auth.ready = false;
    auth.user = null;
    mod.go("/beranda", { replace: true });
    mod.go("/petugas", { replace: true });
    await nextTick();
    expect(mod.route.name).toBe("admin");
    auth.ready = true;
    await nextTick();
    expect(mod.route.name).toBe("login");
    auth.user = null;
  });

  test("halaman publik tidak dialihkan", async () => {
    const { auth } = authMod;
    auth.ready = true;
    auth.user = null;
    mod.go("/daftar", { replace: true });
    await nextTick();
    expect(mod.route.name).toBe("list");
  });
});