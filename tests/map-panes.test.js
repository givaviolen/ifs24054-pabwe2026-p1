import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { flush, mount, spotFixture } from "./helpers";

// ---------- Mock layanan Google Maps ----------
const svc = vi.hoisted(() => ({
  hasKey: true,
  authFailed: false,
  authCallbacks: new Set(),
  load: null,
  off: vi.fn(),
}));
vi.mock("../src/services/googleMaps", () => ({
  hasMapsKey: () => svc.hasKey,
  isMapsAuthFailed: () => svc.authFailed,
  loadGoogleMaps: () => svc.load(),
  onMapsAuthFailure: (fn) => {
    svc.authCallbacks.add(fn);
    return svc.off;
  },
}));

// ---------- Mock Leaflet ----------
const lf = vi.hoisted(() => ({ calls: {}, map: null, layer: null, markers: [] }));
vi.mock("leaflet", () => {
  const chain = (obj) => obj;
  return {
    map: vi.fn(() => {
      const map = {
        setView: vi.fn(() => map),
        fitBounds: vi.fn(),
        invalidateSize: vi.fn(),
        remove: vi.fn(),
      };
      lf.map = map;
      return map;
    }),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    layerGroup: vi.fn(() => {
      const layer = { addTo: vi.fn(() => layer), clearLayers: vi.fn() };
      lf.layer = layer;
      return layer;
    }),
    circle: vi.fn((at, opts) => chain({ at, opts, addTo: vi.fn() })),
    circleMarker: vi.fn((at, opts) => {
      const marker = { at, opts, popup: null, addTo: vi.fn() };
      marker.bindPopup = vi.fn((content) => {
        marker.popup = content;
        return marker;
      });
      lf.markers.push(marker);
      return marker;
    }),
  };
});

import GoogleMapPane from "../src/components/map/GoogleMapPane.vue";
import LeafletMapPane from "../src/components/map/LeafletMapPane.vue";
import * as L from "leaflet";

let current;
const show = (component, props) => (current = mount(component, props));

afterEach(() => {
  current?.unmount();
  current = null;
});

// ---------- Google Maps palsu ----------
function makeGm() {
  const made = { circles: [], markers: [], infoWindows: [], maps: [], bounds: [] };
  class LatLngBounds {
    constructor() { this.points = []; made.bounds.push(this); }
    extend(p) { this.points.push(p); }
    getCenter() { return this.points[0]; }
  }
  class Circle {
    constructor(opts) { this.opts = opts; this.map = opts.map; made.circles.push(this); }
    setMap(m) { this.map = m; }
  }
  class Marker {
    constructor(opts) { this.opts = opts; this.map = opts.map; this.listeners = {}; made.markers.push(this); }
    addListener(ev, fn) { this.listeners[ev] = fn; }
    setMap(m) { this.map = m; }
  }
  class InfoWindow {
    constructor() { this.setContent = vi.fn(); this.open = vi.fn(); this.close = vi.fn(); made.infoWindows.push(this); }
  }
  class GMap {
    constructor(el, opts) {
      this.el = el; this.opts = opts;
      this.fitBounds = vi.fn(); this.setCenter = vi.fn(); this.setZoom = vi.fn();
      made.maps.push(this);
    }
  }
  return { made, gm: { Map: GMap, InfoWindow, LatLngBounds, Circle, Marker, SymbolPath: { CIRCLE: 0 } } };
}

describe("GoogleMapPane", () => {
  beforeEach(() => {
    svc.hasKey = true;
    svc.authFailed = false;
    svc.authCallbacks.clear();
    svc.off.mockClear();
  });

  test("tanpa API key memberi tahu induk (NO_KEY) hanya sekali", async () => {
    svc.hasKey = false;
    const onFailed = vi.fn();
    show(GoogleMapPane, { spots: [], onFailed });
    await flush();
    expect(onFailed).toHaveBeenCalledWith("NO_KEY");
    svc.authCallbacks.forEach((fn) => fn()); // penolakan setelahnya tidak diumumkan dua kali
    expect(onFailed).toHaveBeenCalledTimes(1);
  });

  test("API key sudah ditolak sebelumnya -> AUTH_FAILED", async () => {
    svc.authFailed = true;
    const onFailed = vi.fn();
    show(GoogleMapPane, { spots: [], onFailed });
    await flush();
    expect(onFailed).toHaveBeenCalledWith("AUTH_FAILED");
  });

  test("gagal memuat skrip -> LOAD_FAILED", async () => {
    svc.load = () => Promise.reject(new Error("LOAD_FAILED"));
    const onFailed = vi.fn();
    show(GoogleMapPane, { spots: [], onFailed });
    await flush();
    expect(onFailed).toHaveBeenCalledWith("LOAD_FAILED");
  });

  test("penolakan key yang datang setelah peta dibuat -> AUTH_FAILED", async () => {
    const { gm } = makeGm();
    svc.load = () => Promise.resolve(gm);
    const onFailed = vi.fn();
    show(GoogleMapPane, { spots: [], onFailed });
    await flush();
    expect(onFailed).not.toHaveBeenCalled();
    svc.authCallbacks.forEach((fn) => fn());
    expect(onFailed).toHaveBeenCalledWith("AUTH_FAILED");
  });

  test("menggambar penanda dan zona, lalu memusatkan peta pada banyak titik", async () => {
    const { gm, made } = makeGm();
    svc.load = () => Promise.resolve(gm);
    const onSelect = vi.fn();
    const spots = [
      spotFixture({ id: 1, latitude: 2.5, longitude: 98.5, current_status: "BAHAYA" }),
      spotFixture({ id: 2, latitude: 2.7, longitude: 98.9, current_status: "STATUS-ASING" }),
      spotFixture({ id: 3, latitude: null, longitude: null }),
    ];
    show(GoogleMapPane, { spots, onSelect });
    await flush();

    expect(made.maps[0].opts).toMatchObject({ zoom: 9, mapTypeId: "terrain", streetViewControl: false });
    expect(made.circles).toHaveLength(2);
    expect(made.markers).toHaveLength(2);
    expect(made.circles[0].opts.fillColor).toBe("#d33a3a");
    expect(made.circles[1].opts.fillColor).toBe("#1f9d55"); // status asing -> warna AMAN
    expect(made.maps[0].fitBounds).toHaveBeenCalledWith(made.bounds[0], 48);

    // klik penanda membuka popup; tombol di popup memilih pantai
    made.markers[0].listeners.click();
    const info = made.infoWindows[0];
    expect(info.setContent).toHaveBeenCalledTimes(1);
    expect(info.open).toHaveBeenCalledWith({ map: made.maps[0], anchor: made.markers[0] });
    info.setContent.mock.calls[0][0].querySelector("button").click();
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  test("satu titik: pusat dan zoom; tanpa titik: tidak mengubah tampilan; data baru menggambar ulang", async () => {
    const { gm, made } = makeGm();
    svc.load = () => Promise.resolve(gm);
    const m = show(GoogleMapPane, { spots: [spotFixture({ id: 1 })] });
    await flush();
    const map = made.maps[0];
    expect(map.setCenter).toHaveBeenCalledTimes(1);
    expect(map.setZoom).toHaveBeenCalledWith(13);
    expect(map.fitBounds).not.toHaveBeenCalled();

    const oldOverlays = [...made.circles, ...made.markers];
    m.props.spots = [];
    await nextTick();
    expect(oldOverlays.every((o) => o.map === null)).toBe(true);
    expect(map.setCenter).toHaveBeenCalledTimes(1);
    expect(map.fitBounds).not.toHaveBeenCalled();
  });

  test("perubahan data sebelum peta siap diabaikan; melepas komponen membersihkan semuanya", async () => {
    const { gm, made } = makeGm();
    let resolveLoad;
    svc.load = () => new Promise((r) => { resolveLoad = () => r(gm); });
    const m = show(GoogleMapPane, { spots: [spotFixture()] });
    m.props.spots = [spotFixture({ id: 9 })]; // map belum ada -> draw() keluar lebih awal
    await nextTick();
    expect(made.circles).toHaveLength(0);

    resolveLoad();
    await flush();
    expect(made.circles).toHaveLength(1);

    const overlays = [...made.circles, ...made.markers];
    m.unmount();
    current = null;
    expect(svc.off).toHaveBeenCalled();
    expect(overlays.every((o) => o.map === null)).toBe(true);
    expect(made.infoWindows[0].close).toHaveBeenCalled();
  });

  test("melepas komponen sebelum peta dibuat tidak error", async () => {
    svc.hasKey = false;
    const m = show(GoogleMapPane, { spots: [] });
    await flush();
    expect(() => m.unmount()).not.toThrow();
    current = null;
  });
});

describe("LeafletMapPane", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lf.markers.length = 0;
  });

  test("membuat peta OSM dengan lapisan tile dan pusat Danau Toba", async () => {
    show(LeafletMapPane, { spots: [] });
    await flush();
    expect(L.map).toHaveBeenCalledTimes(1);
    expect(lf.map.setView).toHaveBeenCalledWith([2.65, 98.9], 9);
    expect(L.tileLayer).toHaveBeenCalledWith(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      expect.objectContaining({ maxZoom: 19 })
    );
    expect(lf.map.invalidateSize).toHaveBeenCalled();
    expect(lf.map.fitBounds).not.toHaveBeenCalled();
  });

  test("menggambar zona + penanda dan melewati pantai tanpa koordinat", async () => {
    const onSelect = vi.fn();
    const spots = [
      spotFixture({ id: 1, latitude: 2.5, longitude: 98.5, current_status: "WASPADA" }),
      spotFixture({ id: 2, latitude: 2.7, longitude: 98.9, current_status: "ASING" }),
      spotFixture({ id: 3, latitude: null, longitude: 98 }),
      spotFixture({ id: 4, latitude: 2, longitude: null }),
    ];
    show(LeafletMapPane, { spots, onSelect });
    await flush();
    expect(L.circle).toHaveBeenCalledTimes(2);
    expect(L.circleMarker).toHaveBeenCalledTimes(2);
    expect(L.circle.mock.calls[0][1].color).toBe("#f2b705");
    expect(L.circle.mock.calls[1][1].color).toBe("#1f9d55");
    expect(lf.map.fitBounds).toHaveBeenCalledWith([[2.5, 98.5], [2.7, 98.9]], { padding: [40, 40] });
    expect(lf.layer.clearLayers).toHaveBeenCalled();

    lf.markers[0].popup.querySelector("button").click();
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  test("satu titik memakai setView; data baru menggambar ulang; melepas komponen menghapus peta", async () => {
    const m = show(LeafletMapPane, { spots: [spotFixture()] });
    await flush();
    const map = lf.map;
    expect(map.setView).toHaveBeenLastCalledWith([2.6, 98.7], 13);

    m.props.spots = [spotFixture({ id: 2 })];
    await nextTick();
    expect(lf.layer.clearLayers).toHaveBeenCalledTimes(2);

    m.unmount();
    current = null;
    expect(map.remove).toHaveBeenCalledTimes(1);
  });

  test("invalidateSize tidak dipanggil bila peta sudah dilepas sebelum timer jalan", async () => {
    vi.useFakeTimers();
    const m = show(LeafletMapPane, { spots: [] });
    const map = lf.map;
    m.unmount();
    current = null;
    vi.runAllTimers();
    vi.useRealTimers();
    expect(map.invalidateSize).not.toHaveBeenCalled();
  });

  test("perubahan data setelah peta dilepas diabaikan", async () => {
    const m = show(LeafletMapPane, { spots: [] });
    await flush();
    const clears = lf.layer.clearLayers.mock.calls.length;
    m.unmount();
    current = null;
    m.props.spots = [spotFixture()];
    await nextTick();
    expect(lf.layer.clearLayers.mock.calls.length).toBe(clears);
  });
});