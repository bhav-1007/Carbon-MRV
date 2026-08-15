import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, index: true },
    category: { type: String, enum: ["electricity", "transport", "waste"], required: true, index: true },
    subtype: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    source: { type: String, enum: ["manual", "csv", "system"], default: "manual" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
