import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

connectDb()
  .then(() => {
    app.listen(env.port, () => console.log(`API listening on ${env.port}`));
  })
  .catch((err) => {
    console.error("Failed to start API", err);
    process.exit(1);
  });
