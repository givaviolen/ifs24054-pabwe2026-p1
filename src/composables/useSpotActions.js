import { createSpot, updateSpot, deleteSpot } from "../services/spotApi";
import { describeError } from "../services/apiError";
import { loadSpots } from "./useSpots";

// Aksi tulis data pantai oleh petugas. Setiap aksi memuat ulang data dan memberi tahu lewat `notify`.
// Mengembalikan true bila berhasil.
export function useSpotActions(notify) {
  async function run(task, okMessage, failMessage) {
    try {
      await task();
      await loadSpots();
      notify("ok", okMessage);
      return true;
    } catch (e) {
      notify("err", describeError(e, failMessage).message);
      return false;
    }
  }

  return {
    create: (payload) => run(() => createSpot(payload), "Pantai baru berhasil ditambahkan.", "Gagal menyimpan data."),
    update: (id, payload) => run(() => updateSpot(id, payload), "Data pantai berhasil diperbarui.", "Gagal menyimpan data."),
    remove: (spot) => run(() => deleteSpot(spot.id), `${spot.nama_pantai} dihapus.`, "Gagal menghapus data."),
  };
}
