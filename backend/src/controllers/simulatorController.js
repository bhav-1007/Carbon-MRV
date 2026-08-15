import mongoose from "mongoose";
import { EmissionRecord } from "../models/EmissionRecord.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const simulateWhatIf = asyncHandler(async (req, res) => {
  const { category, reductionPercent = 0, period } = req.body;
  const match = { organizationId: new mongoose.Types.ObjectId(req.organizationId) };
  if (period) match.period = period;

  const records = await EmissionRecord.find(match).populate("activityLogId");
  const relevant = category ? records.filter((record) => record.activityLogId?.category === category) : records;
  const baselineTCO2e = relevant.reduce((sum, record) => sum + record.tCO2e, 0);
  const projectedTCO2e = baselineTCO2e * (1 - reductionPercent / 100);

  res.json({
    baselineTCO2e: Number(baselineTCO2e.toFixed(3)),
    projectedTCO2e: Number(projectedTCO2e.toFixed(3)),
    deltaTCO2e: Number((baselineTCO2e - projectedTCO2e).toFixed(3))
  });
});
