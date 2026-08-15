import { parse } from "csv-parse/sync";
import { ActivityLog } from "../models/ActivityLog.js";
import { Organization } from "../models/Organization.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notFound } from "../utils/apiError.js";
import { paginated } from "../utils/pagination.js";
import { createEmissionRecord } from "../services/emissionService.js";

export const listActivityLogs = asyncHandler(async (req, res) => {
  const result = await paginated(ActivityLog, { organizationId: req.organizationId }, req);
  res.json(result);
});

export const createActivityLog = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.organizationId);
  const activity = await ActivityLog.create({
    ...req.body,
    organizationId: req.organizationId,
    createdBy: req.user._id,
    source: req.body.source || "manual"
  });
  const emissionRecord = await createEmissionRecord(activity, org?.region || "IN");
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
  const activity = await ActivityLog.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.organizationId },
    patch,
    { new: true, runValidators: true }
  );
  if (!activity) throw notFound("Activity log not found");
  res.json({ activity });
});

export const deleteActivityLog = asyncHandler(async (req, res) => {
  const activity = await ActivityLog.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
  if (!activity) throw notFound("Activity log not found");
  res.status(204).send();
});

export const uploadCsv = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.organizationId);
  const rows = parse(req.file.buffer.toString("utf8"), { columns: true, skip_empty_lines: true, trim: true });
  const created = [];
  const errors = [];

  for (const [index, row] of rows.entries()) {
    try {
      const activity = await ActivityLog.create({
        organizationId: req.organizationId,
        departmentId: row.departmentId || undefined,
        category: row.category,
        subtype: row.subtype,
        quantity: Number(row.quantity),
        unit: row.unit,
        date: new Date(row.date),
        source: "csv",
        createdBy: req.user._id
      });
      const emissionRecord = await createEmissionRecord(activity, org?.region || "IN");
      created.push({ activity, emissionRecord });
    } catch (err) {
      errors.push({ row: index + 2, message: err.message });
    }
  }

  res.status(201).json({ createdCount: created.length, errors, created });
});
