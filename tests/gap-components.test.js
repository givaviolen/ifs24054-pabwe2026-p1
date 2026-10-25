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

import { addCondition } from "../src/services/spotApi";
import { allSpots } from "../src/composables/useSpots";
import { auth } from "../src/composables/useAuth";
import AdminLogModal from "../src/components/admin/AdminLogModal.vue";
import AdminView from "../src/views/AdminView.vue";

let current;
const show = (component, props) => (current = mount(component, props));

beforeEach(() => {
  vi.clearAllMocks();
  HTMLDialogElement.prototype.showModal = vi.fn();
  auth.user = { id: 1, nama: "Budi" };
  allSpots.value = [];
});

afterEach(() => {
  current?.unmount();
  current = null;
  allSpots.value = [];
});

describe("AdminLogModal tanpa pantai terpilih", () => {
  test("nama pantai kosong dikirim bila pantai tidak ditemukan", async () => {
    addCondition.mockResolvedValue({ current_status: "AMAN" });
    const onSaved = vi.fn();
    const m = show(AdminLogModal, { spots: [], onSaved });
    m.el.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
    await flush();
    expect(onSaved).toHaveBeenCalledWith({ spot: "", status: "AMAN" });
  });
});

describe("AdminView notifikasi laporan", () => {
  test("memakai teks cadangan bila nama pantai dan status tidak tersedia", async () => {
    allSpots.value = [spotFixture({ id: 1, nama_pantai: "" })];
    addCondition.mockResolvedValue({});
    const m = show(AdminView, { page: "admin-log" });
    m.el.querySelector("tbody button").click();
    await nextTick();
    m.el.querySelector("dialog form").dispatchEvent(new Event("submit", { cancelable: true }));
    await flush();
    expect(m.el.querySelector(".notice.ok").textContent).toBe("Laporan pantai tersimpan. Status sekarang: -.");
  });

  test("dialog tetap terbuka walau pantai yang dipilih belum punya id", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    allSpots.value = [spotFixture({ id: undefined, nama_pantai: "Tanpa Id" })];
    const m = show(AdminView, { page: "admin-log" });
    m.el.querySelector("tbody button").click();
    await nextTick();
    expect(m.el.querySelector("dialog")).not.toBeNull();
    vi.restoreAllMocks();
  });
});