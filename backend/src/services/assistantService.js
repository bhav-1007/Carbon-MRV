import { EmissionRecord } from "../models/EmissionRecord.js";
import { scopeLabel } from "../utils/scopeLabels.js";

export async function answerEmissionQuestion({ organizationId, question }) {
  const records = await EmissionRecord.find({ organizationId }).sort({ period: 1 }).limit(500);
  const total = records.reduce((sum, record) => sum + record.tCO2e, 0);
  const scopeTotals = records.reduce((acc, record) => {
    acc[`scope${record.scope}`] = (acc[`scope${record.scope}`] || 0) + record.tCO2e;
    return acc;
  }, {});

  return {
    answer: `Based on ${records.length} audited emission records, total emissions are ${total.toFixed(2)} tCO2e. ${scopeLabel(1)}: ${(scopeTotals.scope1 || 0).toFixed(2)}, ${scopeLabel(2)}: ${(scopeTotals.scope2 || 0).toFixed(2)}, ${scopeLabel(3)}: ${(scopeTotals.scope3 || 0).toFixed(2)}. Question interpreted: "${question}".`,
    mode: "deterministic-fallback"
  };
}
