import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    estimatedReductionTCO2e: { type: Number, required: true, min: 0 },
    estimatedCost: { type: Number, required: true, min: 0 },
    paybackPeriod: { type: Number, required: true, min: 0 },
    priorityScore: { type: Number, required: true, index: true },
    source: { type: String, enum: ["ml", "fallback"], default: "ml" }
  },
  { timestamps: true }
);

export const Recommendation = mongoose.model("Recommendation", recommendationSchema);
