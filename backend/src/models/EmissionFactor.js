import mongoose from "mongoose";

const emissionFactorSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["electricity", "transport", "waste"], required: true, index: true },
    subtype: { type: String, required: true, trim: true, index: true },
    region: { type: String, default: "IN", index: true },
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    source: { type: String, required: true },
    effectiveFrom: { type: Date, required: true, index: true },
    version: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const EmissionFactor = mongoose.model("EmissionFactor", emissionFactorSchema);
