import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: "department" },
    population: { type: Number, default: 0 }
  },
  { _id: true }
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["college", "hospital", "office"], default: "college" },
    region: { type: String, default: "IN" },
    campusSizeSqM: { type: Number, default: 0 },
    studentCount: { type: Number, default: 0 },
    employeeCount: { type: Number, default: 0 },
    departments: [departmentSchema]
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);
