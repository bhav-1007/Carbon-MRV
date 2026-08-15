import mongoose from "mongoose";

const emissionRecordSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, index: true },
    activityLogId: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityLog", required: true },
    factorId: { type: mongoose.Schema.Types.ObjectId, ref: "EmissionFactor", required: true },
    scope: { type: Number, enum: [1, 2, 3], required: true, index: true },
    tCO2e: { type: Number, required: true, min: 0 },
    period: { type: String, required: true, index: true },
    hash: { type: String, required: true },
    previousHash: { type: String, default: "" }
  },
  { timestamps: true }
);

export const EmissionRecord = mongoose.model("EmissionRecord", emissionRecordSchema);
