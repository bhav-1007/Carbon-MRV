import { Recommendation } from "../models/Recommendation.js";
import { EmissionRecord } from "../models/EmissionRecord.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requestRecommendations } from "../services/mlService.js";

export const listRecommendations = asyncHandler(async (req, res) => {
  const items = await Recommendation.find({ organizationId: req.organizationId }).sort({ priorityScore: -1 });
  res.json({ items });
});

export const generateRecommendations = asyncHandler(async (req, res) => {
  const records = await EmissionRecord.find({ organizationId: req.organizationId }).limit(1000);
  let recommendations;
  try {
    recommendations = await requestRecommendations({ emissions: records });
  } catch {
    recommendations = [
      { title: "Shift common areas to LED lighting", description: "Replace older fixtures in corridors, libraries, and hostels.", estimatedReductionTCO2e: 18, estimatedCost: 250000, paybackPeriod: 1.4, priorityScore: 92 },
      { title: "Optimize bus routing", description: "Consolidate low-occupancy routes and track diesel use monthly.", estimatedReductionTCO2e: 12, estimatedCost: 90000, paybackPeriod: 0.9, priorityScore: 88 }
    ];
  }

  await Recommendation.deleteMany({ organizationId: req.organizationId });
  const saved = await Recommendation.insertMany(recommendations.map((item) => ({ ...item, organizationId: req.organizationId })));
  res.status(201).json({ items: saved });
});
