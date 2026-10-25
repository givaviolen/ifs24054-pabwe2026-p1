import { describe, test, expect, vi } from "vitest";
import { NAV_LINKS, ADMIN_TABS } from "../src/constants/navigation";
import { EDUCATION_ITEMS } from "../src/data/education";
import { SPOT_PHOTOS, spotPhoto } from "../src/data/spotPhotos";
import { publicImageStyle } from "../src/utils/publicImage";
import { COLORS, LABELS, ZONE_RADIUS_M, buildSpotInfo } from "../src/utils/mapShared";
import { parsePath } from "../src/utils/route";

describe("navigasi", () => {
  test("setiap menu menunjuk rute yang dikenal", () => {
    for (const l of NAV_LINKS) expect(parsePath(l.href).name).toBe(l.name);
    for (const t of ADMIN_TABS) expect(parsePath(t.href).name).toBe(t.name);
  });
});

describe("data edukasi", () => {
  test("setiap item lengkap dan tujuannya valid", () => {
    expect(EDUCATION_ITEMS).toHaveLength(4);
    for (const e of EDUCATION_ITEMS) {
      for (const f of ["tag", "title", "text", "action", "path"]) expect(e[f]).toBeTruthy();
      expect(parsePath(e.path).name).not.toBe("notfound");
      expect(typeof e.patch).toBe("object");
    }
  });
});

describe("foto pantai", () => {
  test("spotPhoto mengembalikan path untuk pantai terdaftar, null untuk lainnya", () => {
    const [name, path] = Object.entries(SPOT_PHOTOS)[0];
    expect(spotPhoto({ nama_pantai: name })).toBe(path);
    expect(spotPhoto({ nama_pantai: "Tidak Terdaftar" })).toBeNull();
  });
});

describe("publicImageStyle", () => {
  test("membuat style latar dari folder public/images", () => {
    expect(publicImageStyle("hero.jpg")).toEqual({ backgroundImage: "url(/images/hero.jpg)" });
  });
});

describe("mapShared", () => {
  test("warna dan label per status", () => {
    expect(COLORS.AMAN).toBe("#1f9d55");
    expect(LABELS.BAHAYA).toBe("Bahaya / Tutup");
    expect(ZONE_RADIUS_M).toBe(400);
  });

  test("buildSpotInfo menyusun popup dengan textContent dan memanggil onDetail", () => {
    const onDetail = vi.fn();
    const spot = { id: 9, nama_pantai: "<b>Pantai</b>", kabupaten: "Toba", current_status: "WASPADA", latitude: 2.5, longitude: 98.7 };
    const root = buildSpotInfo(spot, onDetail);
    expect(root.querySelector("strong").textContent).toBe("<b>Pantai</b>");
    expect(root.querySelector("b")).toBeNull(); // tidak ada HTML yang disuntikkan
    expect(root.textContent).toContain("Waspada");
    expect(root.textContent).toContain("Kabupaten Toba");
    const a = root.querySelector("a");
    expect(a.href).toContain("query=2.5,98.7");
    expect(a.target).toBe("_blank");
    expect(a.rel).toBe("noopener noreferrer");
    root.querySelector("button").click();
    expect(onDetail).toHaveBeenCalledWith(9);
  });

  test("status tak dikenal memakai teks status apa adanya", () => {
    const root = buildSpotInfo(
      { id: 1, nama_pantai: "X", kabupaten: "Y", current_status: "ASING", latitude: 1, longitude: 2 },
      () => {}
    );
    expect(root.textContent).toContain("ASING");
  });
});