import { Router } from "express";
import { body } from "express-validator";
import { auditTrail, calculateEmissions, dashboard, forecast, listEmissions } from "../controllers/emissionController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const emissionRoutes = Router();
emissionRoutes.use(requireAuth);
emissionRoutes.post("/calculate", calculateEmissions);
emissionRoutes.get("/", listEmissions);
emissionRoutes.get("/dashboard", dashboard);
emissionRoutes.get("/audit-trail", auditTrail);
emissionRoutes.post("/forecast", forecast);
