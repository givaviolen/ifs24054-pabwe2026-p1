import { createDb, seedSpots } from "./db.js";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

const db = createDb();
seedSpots(db);

createApp(db).listen(PORT, () => {
  console.log(`TobaWaterSafe API berjalan di http://localhost:${PORT}`);
  if (!process.env.PETUGAS_CODE) {
    console.warn("PERINGATAN: PETUGAS_CODE belum diatur, memakai kode bawaan 'TOBA2026'. Ganti lewat file .env.");
  }
});
