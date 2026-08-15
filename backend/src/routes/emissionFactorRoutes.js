import { Router } from "express";
import { body } from "express-validator";
import { createFactor, listFactors, updateFactor } from "../controllers/emissionFactorController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const emissionFactorRoutes = Router();
emissionFactorRoutes.use(requireAuth);
emissionFactorRoutes.get("/", listFactors);
emissionFactorRoutes.post("/", requireRole("admin", "sustainability_officer"), [
  body("category").isIn(["electricity", "transport", "waste"]),
  body("subtype").isString().notEmpty(),
  body("value").isFloat({ min: 0 }),
  body("unit").isString().notEmpty(),
  body("source").isString().notEmpty(),
  body("effectiveFrom").isISO8601(),
  body("version").isString().notEmpty()
], validate, createFactor);
emissionFactorRoutes.patch("/:id", requireRole("admin", "sustainability_officer"), updateFactor);
