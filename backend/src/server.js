import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

connectDb()
  .then(() => {
    const server = app.listen(env.port, () => console.log(`API listening on ${env.port}`));
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`API port ${env.port} is already in use. Stop the existing backend before starting another one.`);
        process.exit(1);
      }
      throw err;
    });
  })
  .catch((err) => {
    console.error("Failed to start API", err);
    process.exit(1);
  });
