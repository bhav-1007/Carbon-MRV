import crypto from "crypto";
import { ActivityLog } from "../models/ActivityLog.js";
import { EmissionFactor } from "../models/EmissionFactor.js";
import { EmissionRecord } from "../models/EmissionRecord.js";
import { ApiError } from "../utils/apiError.js";

export function inferScope(activity) {
  if (activity.category === "electricity") return 2;
  if (activity.category === "transport" && ["diesel", "petrol", "institution_bus", "generator_diesel"].includes(activity.subtype)) return 1;
  return 3;
}

export function periodFromDate(date) {
  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function hashRecord(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function findFactor(activity, region = "IN") {
  const factor = await EmissionFactor.findOne({
    category: activity.category,
    subtype: activity.subtype,
    region,
    effectiveFrom: { $lte: activity.date },
    isActive: true
  }).sort({ effectiveFrom: -1, createdAt: -1 });

  if (!factor) {
    throw new ApiError(422, "EMISSION_FACTOR_MISSING", `No active factor for ${activity.category}/${activity.subtype}`);
  }

  return factor;
}

export async function calculateForActivity(activity, region = "IN") {
  const factor = await findFactor(activity, region);
  const tCO2e = (activity.quantity * factor.value) / 1000;
  return {
    scope: inferScope(activity),
    tCO2e: Number(tCO2e.toFixed(5)),
    period: periodFromDate(activity.date),
    factor
  };
}

export async function createEmissionRecord(activity, region = "IN") {
  const existing = await EmissionRecord.findOne({ activityLogId: activity._id });
  if (existing) return existing;

  const calculated = await calculateForActivity(activity, region);
  const previous = await EmissionRecord.findOne({ organizationId: activity.organizationId }).sort({ createdAt: -1 });
  const previousHash = previous?.hash || "";
  const departmentId = activity.departmentId || undefined;
  const payload = {
    organizationId: String(activity.organizationId),
    departmentId: departmentId ? String(departmentId) : "",
    activityLogId: String(activity._id),
    factorId: String(calculated.factor._id),
    scope: calculated.scope,
    tCO2e: calculated.tCO2e,
    period: calculated.period,
    previousHash
  };

  return EmissionRecord.create({
    ...payload,
    departmentId,
    factorId: calculated.factor._id,
    hash: hashRecord(payload)
  });
}

export async function recalculateOrganization(organizationId, region = "IN") {
  await EmissionRecord.deleteMany({ organizationId });
  const logs = await ActivityLog.find({ organizationId }).sort({ date: 1 });
  const records = [];
  for (const log of logs) {
    records.push(await createEmissionRecord(log, region));
  }
  return records;
}

export async function getDashboardData(organizationId) {
  const byPeriod = await EmissionRecord.aggregate([
    { $match: { organizationId } },
    { $group: { _id: "$period", total: { $sum: "$tCO2e" }, scope1: { $sum: { $cond: [{ $eq: ["$scope", 1] }, "$tCO2e", 0] } }, scope2: { $sum: { $cond: [{ $eq: ["$scope", 2] }, "$tCO2e", 0] } }, scope3: { $sum: { $cond: [{ $eq: ["$scope", 3] }, "$tCO2e", 0] } } } },
    { $sort: { _id: 1 } }
  ]);

  const byDepartment = await EmissionRecord.aggregate([
    { $match: { organizationId } },
    { $group: { _id: "$departmentId", total: { $sum: "$tCO2e" } } },
    { $sort: { total: -1 } }
  ]);

  const byScope = await EmissionRecord.aggregate([
    { $match: { organizationId } },
    { $group: { _id: "$scope", total: { $sum: "$tCO2e" } } },
    { $sort: { _id: 1 } }
  ]);

  return { byPeriod, byDepartment, byScope };
}
