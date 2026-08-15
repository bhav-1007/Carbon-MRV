import { Report } from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notFound } from "../utils/apiError.js";
import { generatePdfReport } from "../services/reportService.js";

export const listReports = asyncHandler(async (req, res) => {
  const items = await Report.find({ organizationId: req.organizationId }).sort({ generatedAt: -1 });
  res.json({ items });
});

export const createReport = asyncHandler(async (req, res) => {
  const generatedFileUrl = await generatePdfReport({ organizationId: req.organizationId, period: req.body.period });
  const report = await Report.create({ organizationId: req.organizationId, period: req.body.period, generatedFileUrl });
  res.status(201).json({ report });
});

export const downloadReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!report) throw notFound("Report not found");
  res.redirect(report.generatedFileUrl);
});
