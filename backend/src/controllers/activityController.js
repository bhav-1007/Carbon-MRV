import { parse } from "csv-parse/sync";
import { ActivityLog } from "../models/ActivityLog.js";
import { Organization } from "../models/Organization.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, notFound } from "../utils/apiError.js";
import { paginated } from "../utils/pagination.js";
import { createEmissionRecord, findFactor, recalculateOrganization } from "../services/emissionService.js";

const headerAliases = {
  category: ["category", "type", "activityCategory", "activity_category"],
  subtype: ["subtype", "activity", "activityType", "activity_type", "fuelType", "fuel_type"],
  quantity: ["quantity", "amount", "usage", "value"],
  unit: ["unit", "units"],
  date: ["date", "activityDate", "activity_date"],
  departmentId: ["departmentId", "department_id"],
  departmentName: ["department", "departmentName", "department_name"]
};

const subtypeAliases = {
  grid_electricity: "grid",
  electricity: "grid",
  bus: "commute_bus",
  commute: "commute_bus",
  mixed_landfill: "landfill_mixed",
  landfill: "landfill_mixed",
  paper_recycling: "recycled_paper",
  paper: "recycled_paper"
};

function readField(row, field) {
  const wanted = headerAliases[field] || [field];
  const entries = Object.entries(row).map(([key, value]) => [key.replace(/\s+/g, "").toLowerCase(), value]);
  const normalized = new Map(entries);
  for (const key of wanted) {
    const value = normalized.get(key.toLowerCase());
    if (value !== undefined && value !== "") return String(value).trim();
  }
  return "";
}

function normalizeToken(value) {
  return String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function normalizeCsvRow(row, org) {
  const category = normalizeToken(readField(row, "category"));
  const rawSubtype = normalizeToken(readField(row, "subtype"));
  const subtype = subtypeAliases[rawSubtype] || rawSubtype;
  const quantity = Number(readField(row, "quantity"));
  const unit = readField(row, "unit");
  const rawDate = readField(row, "date");
  const departmentId = readField(row, "departmentId");
  const departmentName = readField(row, "departmentName");
  const department = departmentName
    ? org?.departments?.find((dept) => normalizeToken(dept.name) === normalizeToken(departmentName))
    : null;

  return {
    category,
    subtype,
    quantity,
    unit,
    date: rawDate ? new Date(rawDate) : null,
    departmentId: departmentId || department?._id || undefined
  };
}

function validateCsvCandidate(candidate) {
  if (!["electricity", "transport", "waste"].includes(candidate.category)) {
    return "category must be electricity, transport, or waste";
  }
  if (!candidate.subtype) return "subtype/activity is required";
  if (!Number.isFinite(candidate.quantity) || candidate.quantity < 0) {
    return "quantity must be a positive number";
  }
  if (!candidate.unit) return "unit is required";
  if (!candidate.date || Number.isNaN(candidate.date.getTime())) {
    return "date must be a valid date";
  }
  return "";
}

export const listActivityLogs = asyncHandler(async (req, res) => {
  const result = await paginated(ActivityLog, { organizationId: req.organizationId }, req);
  res.json(result);
});

export const createActivityLog = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.organizationId);
  const region = org?.region || "IN";
  const candidate = {
    ...req.body,
    organizationId: req.organizationId,
    createdBy: req.user._id,
    source: req.body.source || "manual",
    date: new Date(req.body.date)
  };
  await findFactor(candidate, region);
  const activity = await ActivityLog.create({
    ...candidate
  });
  const emissionRecord = await createEmissionRecord(activity, region);
  res.status(201).json({ activity, emissionRecord });
});

export const getActivityLog = asyncHandler(async (req, res) => {
  const activity = await ActivityLog.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!activity) throw notFound("Activity log not found");
  res.json({ activity });
});

export const updateActivityLog = asyncHandler(async (req, res) => {
  const allowed = ["departmentId", "category", "subtype", "quantity", "unit", "date", "source"];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const existing = await ActivityLog.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!existing) throw notFound("Activity log not found");
  const org = await Organization.findById(req.organizationId);
  const region = org?.region || "IN";
  await findFactor({ ...existing.toObject(), ...patch, date: patch.date ? new Date(patch.date) : existing.date }, region);
  const activity = await ActivityLog.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.organizationId },
    patch,
    { new: true, runValidators: true }
  );
  const records = await recalculateOrganization(req.organizationId, region);
  res.json({ activity, records });
});

export const deleteActivityLog = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.organizationId);
  const activity = await ActivityLog.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
  if (!activity) throw notFound("Activity log not found");
  await recalculateOrganization(req.organizationId, org?.region || "IN");
  res.status(204).send();
});

export const uploadCsv = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "CSV_FILE_REQUIRED", "Upload a CSV file using the file field");
  }

  const org = await Organization.findById(req.organizationId);
  const region = org?.region || "IN";
  let rows;
  try {
    rows = parse(req.file.buffer.toString("utf8"), { columns: true, skip_empty_lines: true, trim: true });
  } catch (err) {
    throw new ApiError(400, "CSV_PARSE_FAILED", `Could not parse CSV: ${err.message}`);
  }
  const created = [];
  const errors = [];

  for (const [index, row] of rows.entries()) {
    try {
      const normalized = normalizeCsvRow(row, org);
      const validationError = validateCsvCandidate(normalized);
      if (validationError) {
        throw new ApiError(422, "CSV_ROW_INVALID", validationError);
      }

      const candidate = {
        organizationId: req.organizationId,
        departmentId: normalized.departmentId,
        category: normalized.category,
        subtype: normalized.subtype,
        quantity: normalized.quantity,
        unit: normalized.unit,
        date: normalized.date,
        source: "csv",
        createdBy: req.user._id
      };
      await findFactor(candidate, region);
      const activity = await ActivityLog.create({
        ...candidate
      });
      const emissionRecord = await createEmissionRecord(activity, region);
      created.push({
        id: activity._id,
        category: activity.category,
        subtype: activity.subtype,
        quantity: activity.quantity,
        unit: activity.unit,
        date: activity.date,
        tCO2e: emissionRecord.tCO2e,
        period: emissionRecord.period
      });
    } catch (err) {
      errors.push({ row: index + 2, message: err.message });
    }
  }

  res.status(201).json({ createdCount: created.length, failedCount: errors.length, errors, created });
});
