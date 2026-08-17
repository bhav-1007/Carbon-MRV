import path from "path";
import { fileURLToPath } from "url";
import { env } from "./env.js";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const paths = {
  backendDir,
  uploadRoot: path.resolve(backendDir, env.uploadDir)
};
