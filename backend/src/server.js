import { createDb, seedIfEmpty } from "./db.js";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

const db = createDb();
seedIfEmpty(db);

createApp(db).listen(PORT, () => {
  console.log(`TobaWaterSafe API berjalan di http://localhost:${PORT}`);
});
