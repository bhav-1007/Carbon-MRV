import { Router } from "express";
import { body } from "express-validator";
import { askAssistant } from "../controllers/assistantController.js";
import { peerComparison } from "../controllers/benchmarkController.js";
import { leaderboard } from "../controllers/leaderboardController.js";
import { getMyOrganization, updateMyOrganization } from "../controllers/organizationController.js";
import { createReport, downloadReport, listReports } from "../controllers/reportController.js";
import { generateRecommendations, listRecommendations } from "../controllers/recommendationController.js";
import { simulateWhatIf } from "../controllers/simulatorController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const miscRoutes = Router();
miscRoutes.use(requireAuth);

miscRoutes.get("/organizations/me", getMyOrganization);
miscRoutes.patch("/organizations/me", requireRole("admin", "sustainability_officer"), updateMyOrganization);

miscRoutes.get("/reports", listReports);
miscRoutes.post("/reports", [body("period").isString().notEmpty()], validate, createReport);
miscRoutes.get("/reports/:id/download", downloadReport);

miscRoutes.get("/recommendations", listRecommendations);
miscRoutes.post("/recommendations/generate", generateRecommendations);

miscRoutes.post("/simulator/what-if", [
  body("reductionPercent").isFloat({ min: 0, max: 100 })
], validate, simulateWhatIf);

miscRoutes.get("/benchmarks/peer-comparison", peerComparison);
miscRoutes.get("/leaderboard", leaderboard);
miscRoutes.post("/assistant/query", [body("question").isString().isLength({ min: 3 })], validate, askAssistant);
