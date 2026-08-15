import mongoose from "mongoose";
import { ActivityLog } from "../models/ActivityLog.js";
import { EmissionRecord } from "../models/EmissionRecord.js";
import { Organization } from "../models/Organization.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notFound } from "../utils/apiError.js";
import { paginated } from "../utils/pagination.js";
import { createEmissionRecord, getDashboardData, recalculateOrganization } from "../services/emissionService.js";
import { requestForecast } from "../services/mlService.js";

export const calculateEmissions = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.organizationId);
  if (req.body.activityLogId) {
    const activity = await ActivityLog.findOne({ _id: req.body.activityLogId, organizationId: req.organizationId });
    if (!activity) throw notFound("Activity log not found");
    return res.json({ records: [await createEmissionRecord(activity, org?.region || "IN")] });
  }
  const records = await recalculateOrganization(req.organizationId, org?.region || "IN");
  res.json({ records });
});

export const listEmissions = asyncHandler(async (req, res) => {
  const result = await paginated(EmissionRecord, { organizationId: req.organizationId }, req, { populate: "activityLogId factorId" });
  res.json(result);
});

export const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardData(new mongoose.Types.ObjectId(req.organizationId));
  res.json(data);
});

export const auditTrail = asyncHandler(async (req, res) => {
  const records = await EmissionRecord.find({ organizationId: req.organizationId }).sort({ createdAt: 1 }).select("period scope tCO2e hash previousHash createdAt");
  res.json({ items: records });
});

export const forecast = asyncHandler(async (req, res) => {
  const history = await EmissionRecord.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(req.organizationId) } },
    { $group: { _id: "$period", total: { $sum: "$tCO2e" } } },
    { $sort: { _id: 1 } }
  ]);
  const points = history.map((item) => ({ period: item._id, tCO2e: item.total }));

  let result;
  try {
    result = await requestForecast(points);
  } catch {
    const values = points.map((point) => point.tCO2e);
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    result = {
      nextPeriodTCO2e: Number(average.toFixed(3)),
      confidence: 0.4,
      method: "backend-fallback-average"
    };
  }

  res.json(result);
});
