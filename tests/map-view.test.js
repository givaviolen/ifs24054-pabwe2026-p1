import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { h, nextTick } from "vue";
import { flush, mount, spotFixture } from "./helpers";

const maps = vi.hoisted(() => ({ hasKey: true, authFailed: false }));
vi.mock("../src/services/googleMaps", () => ({
  hasMapsKey: () => maps.hasKey,
  isMapsAuthFailed: () => maps.authFailed,
}));

// Panel peta diganti stub ringan; panel aslinya diuji di map-panes.test.js.
vi.mock("../src/components/map/GoogleMapPane.vue", () => ({
  __esModule: true,
  default: {
    name: "GoogleStub",
    props: ["spots"],
    emits: ["select", "failed"],
    render() {
      return h("div", { class: "google-stub" }, [
        h("button", { class: "pick", onClick: () => this.$emit("select", 11) }),
        h("button", { class: "fail", onClick: () => this.$emit("failed", "LOAD_FAILED") }),
      ]);
    },
  },
}));
vi.mock("../src/components/map/LeafletMapPane.vue", () => ({
  __esModule: true,
  default: {
    name: "LeafletStub",
    props: ["spots"],
    emits: ["select"],
    render() {
      return h("div", { class: "osm-stub" }, [h("button", { class: "pick", onClick: () => this.$emit("select", 22) })]);
    },
  },
}));

import MapView from "../src/components/map/MapView.vue";

let current;
const show = async (props) => {
  current = mount(MapView, props);
  await flush();
  return current;
};

beforeEach(() => {
  maps.hasKey = true;
  maps.authFailed = false;
});
afterEach(() => {
  current?.unmount();
  current = null;
});

describe("MapView", () => {
  test("tanpa API key: memakai OpenStreetMap dengan catatan NO_KEY", async () => {
    maps.hasKey = false;
    const onSelect = vi.fn();
    const m = await show({ spots: [spotFixture()], onSelect });
    expect(m.el.querySelector(".osm-stub")).not.toBeNull();
    expect(m.el.querySelector(".google-stub")).toBeNull();
    expect(m.el.querySelector(".note").textContent).toContain("API key Google Maps belum diisi");
    m.el.querySelector(".pick").click();
    expect(onSelect).toHaveBeenCalledWith(22);
  });

  test("API key ditolak sejak awal: OpenStreetMap dengan catatan AUTH_FAILED", async () => {
    maps.authFailed = true;
    const m = await show({ spots: [] });
    expect(m.el.querySelector(".osm-stub")).not.toBeNull();
    expect(m.el.querySelector(".note").textContent).toContain("menolak API key");
  });

  test("API key valid: memakai Google Maps tanpa catatan dan meneruskan pilihan", async () => {
    const onSelect = vi.fn();
    const m = await show({ spots: [spotFixture()], onSelect });
    expect(m.el.querySelector(".google-stub")).not.toBeNull();
    expect(m.el.querySelector(".note")).toBeNull();
    m.el.querySelector(".pick").click();
    expect(onSelect).toHaveBeenCalledWith(11);
  });

  test("Google Maps gagal: beralih ke OpenStreetMap dengan catatan alasannya", async () => {
    const m = await show({ spots: [spotFixture()] });
    m.el.querySelector(".fail").click();
    await nextTick();
    await flush();
    expect(m.el.querySelector(".osm-stub")).not.toBeNull();
    expect(m.el.querySelector(".note").textContent).toContain("gagal dimuat");
  });

  test("legenda menghitung pantai tanpa koordinat", async () => {
    const m = await show({
      spots: [spotFixture({ id: 1 }), spotFixture({ id: 2, latitude: null }), spotFixture({ id: 3, longitude: null })],
    });
    expect(m.el.querySelectorAll(".legend span")).toHaveLength(4);
    expect(m.el.querySelector(".legend .muted").textContent).toContain("2 pantai belum memiliki koordinat");
    m.props.spots = [spotFixture()];
    await nextTick();
    expect(m.el.querySelector(".legend .muted")).toBeNull();
  });
});