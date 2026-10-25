import { test, expect, vi, afterEach } from "vitest";
import { createApp, h, nextTick, reactive } from "vue";
import { flush, spotFixture } from "./helpers";

const lf = vi.hoisted(() => ({ failNext: false, drawn: 0 }));
vi.mock("leaflet", () => ({
  map: vi.fn(() => {
    if (lf.failNext) {
      lf.failNext = false;
      throw new Error("Leaflet gagal dibuat");
    }
    const map = { setView: vi.fn(() => map), fitBounds: vi.fn(), invalidateSize: vi.fn(), remove: vi.fn() };
    return map;
  }),
  tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  layerGroup: vi.fn(() => {
    const layer = { addTo: vi.fn(() => layer), clearLayers: vi.fn() };
    return layer;
  }),
  circle: vi.fn(() => {
    lf.drawn += 1;
    return { addTo: vi.fn() };
  }),
  circleMarker: vi.fn(() => ({ bindPopup: vi.fn(() => ({ addTo: vi.fn() })) })),
}));

import LeafletMapPane from "../src/components/map/LeafletMapPane.vue";

afterEach(() => {
  vi.restoreAllMocks();
});

test("LeafletMapPane: bila peta gagal dibuat, perubahan data tidak menggambar apa pun", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  lf.failNext = true;
  const props = reactive({ spots: [] });
  const el = document.createElement("div");
  document.body.appendChild(el);
  const app = createApp({ render: () => h(LeafletMapPane, { ...props }) });
  const onError = vi.fn(); // kegagalan pembuatan peta ditangani Vue, bukan membuat aplikasi mati
  app.config.errorHandler = onError;
  app.mount(el);
  await flush();
  expect(onError).toHaveBeenCalledTimes(1);

  props.spots = [spotFixture()];
  await nextTick();
  expect(lf.drawn).toBe(0);
  app.unmount();
  el.remove();
});