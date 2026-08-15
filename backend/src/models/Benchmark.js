import mongoose from "mongoose";

const benchmarkSchema = new mongoose.Schema(
  {
    anonymizedName: { type: String, required: true },
    type: { type: String, enum: ["college", "hospital", "office"], required: true },
    region: { type: String, default: "IN" },
    population: { type: Number, required: true },
    annualTCO2e: { type: Number, required: true }
  },
  { timestamps: true }
);

export const Benchmark = mongoose.model("Benchmark", benchmarkSchema);
