import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { paths } from "../config/paths.js";
import { EmissionRecord } from "../models/EmissionRecord.js";
import { Organization } from "../models/Organization.js";
import { scopeLabel } from "../utils/scopeLabels.js";

export async function generatePdfReport({ organizationId, period }) {
  const org = await Organization.findById(organizationId);
  const records = await EmissionRecord.find({ organizationId, period }).populate("activityLogId factorId");
  const reportsDir = path.join(paths.uploadRoot, "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const filename = `${organizationId}-${period}-${Date.now()}.pdf`;
  const filePath = path.join(reportsDir, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(20).text("Institutional Carbon Footprint Report");
    doc.moveDown();
    doc.fontSize(12).text(`Organization: ${org?.name || organizationId}`);
    doc.text(`Period: ${period}`);
    doc.text(`Generated: ${new Date().toISOString()}`);
    doc.moveDown();

    const total = records.reduce((sum, record) => sum + record.tCO2e, 0);
    doc.fontSize(16).text(`Total emissions: ${total.toFixed(3)} tCO2e`);
    doc.moveDown();

    records.forEach((record) => {
      doc.fontSize(10).text(`${scopeLabel(record.scope)} | ${record.tCO2e.toFixed(3)} tCO2e | hash ${record.hash.slice(0, 16)}...`);
    });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return `/uploads/reports/${filename}`;
}
