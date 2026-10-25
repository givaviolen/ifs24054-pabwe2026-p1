import { createApp, h, nextTick, reactive } from "vue";

// Menunggu promise dan timer kecil selesai (komponen async, watcher, dll).
export async function flush(times = 6) {
  for (let i = 0; i < times; i++) {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  await nextTick();
}

// Memasang komponen ke DOM tanpa library tambahan. `props` reaktif: ubah nilainya untuk memperbarui komponen.
export function mount(component, initialProps = {}) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const props = reactive({ ...initialProps });
  const app = createApp({ render: () => h(component, { ...props }) });
  app.mount(el);
  return {
    el,
    props,
    app,
    unmount() {
      app.unmount();
      el.remove();
    },
  };
}

export const spotFixture = (over = {}) => ({
  id: 1,
  nama_pantai: "Pantai Parbaba",
  kabupaten: "Samosir",
  current_status: "AMAN",
  kedalaman_avg: 1.5,
  is_ramah_anak: 1,
  ada_pelampung: 1,
  latitude: 2.6,
  longitude: 98.7,
  kondisi_eceng_gondok: "Bersih",
  tinggi_ombak: "Tenang",
  kondisi_updated_at: null,
  ...over,
});