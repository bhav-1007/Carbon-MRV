import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    period: { type: String, required: true },
    generatedFileUrl: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
