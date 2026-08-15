import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import { createActivityLog, deleteActivityLog, getActivityLog, listActivityLogs, updateActivityLog, uploadCsv } from "../controllers/activityController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
export const activityRoutes = Router();

activityRoutes.use(requireAuth);
activityRoutes.get("/", listActivityLogs);
activityRoutes.post("/", [
  body("category").isIn(["electricity", "transport", "waste"]),
  body("subtype").isString().notEmpty(),
  body("quantity").isFloat({ min: 0 }),
  body("unit").isString().notEmpty(),
  body("date").isISO8601()
], validate, createActivityLog);
activityRoutes.post("/upload-csv", upload.single("file"), uploadCsv);
activityRoutes.get("/:id", getActivityLog);
activityRoutes.patch("/:id", updateActivityLog);
activityRoutes.delete("/:id", deleteActivityLog);
