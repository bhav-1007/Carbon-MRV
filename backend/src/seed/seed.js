import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { Benchmark } from "../models/Benchmark.js";
import { EmissionFactor } from "../models/EmissionFactor.js";
import { EmissionRecord } from "../models/EmissionRecord.js";
import { Organization } from "../models/Organization.js";
import { Recommendation } from "../models/Recommendation.js";
import { Report } from "../models/Report.js";
import { User } from "../models/User.js";
import { createEmissionRecord } from "../services/emissionService.js";

async function seed() {
  await connectDb();
  await Promise.all([
    ActivityLog.deleteMany({}),
    Benchmark.deleteMany({}),
    EmissionFactor.deleteMany({}),
    EmissionRecord.deleteMany({}),
    Organization.deleteMany({}),
    Recommendation.deleteMany({}),
    Report.deleteMany({}),
    User.deleteMany({})
  ]);

  const org = await Organization.create({
    name: "National Institute of Sustainable Technology",
    type: "college",
    region: "IN",
    campusSizeSqM: 84000,
    studentCount: 4200,
    employeeCount: 620,
    departments: [
      { name: "Computer Science", type: "department", population: 820 },
      { name: "Mechanical Engineering", type: "department", population: 760 },
      { name: "Administration", type: "department", population: 180 },
      { name: "Hostel A", type: "hostel", population: 640 },
      { name: "Hostel B", type: "hostel", population: 610 }
    ]
  });

  const [cs, mech, admin, hostelA, hostelB] = org.departments;
  const adminUser = await User.create({
    name: "SIH Admin",
    email: "admin@sih.local",
    passwordHash: await bcrypt.hash("Password123", 12),
    role: "admin",
    organizationId: org._id,
    departmentId: admin._id
  });

  await EmissionFactor.insertMany([
    { category: "electricity", subtype: "grid", region: "IN", value: 0.716, unit: "kgCO2e/kWh", source: "CEA India baseline", effectiveFrom: new Date("2025-01-01"), version: "2025.1" },
    { category: "transport", subtype: "diesel", region: "IN", value: 2.68, unit: "kgCO2e/litre", source: "GHG Protocol default", effectiveFrom: new Date("2025-01-01"), version: "2025.1" },
    { category: "transport", subtype: "petrol", region: "IN", value: 2.31, unit: "kgCO2e/litre", source: "GHG Protocol default", effectiveFrom: new Date("2025-01-01"), version: "2025.1" },
    { category: "transport", subtype: "commute_bus", region: "IN", value: 0.08, unit: "kgCO2e/passenger-km", source: "Modeled India urban", effectiveFrom: new Date("2025-01-01"), version: "2025.1" },
    { category: "waste", subtype: "landfill_mixed", region: "IN", value: 0.58, unit: "kgCO2e/kg", source: "IPCC waste factor", effectiveFrom: new Date("2025-01-01"), version: "2025.1" },
    { category: "waste", subtype: "recycled_paper", region: "IN", value: 0.07, unit: "kgCO2e/kg", source: "Lifecycle estimate", effectiveFrom: new Date("2025-01-01"), version: "2025.1" }
  ]);

  const activityRows = [
    [cs._id, "electricity", "grid", 12200, "kWh", "2026-01-12"],
    [mech._id, "electricity", "grid", 15800, "kWh", "2026-01-13"],
    [admin._id, "electricity", "grid", 7400, "kWh", "2026-01-13"],
    [hostelA._id, "electricity", "grid", 18600, "kWh", "2026-01-14"],
    [hostelB._id, "electricity", "grid", 17200, "kWh", "2026-01-14"],
    [admin._id, "transport", "diesel", 980, "litre", "2026-01-20"],
    [cs._id, "transport", "commute_bus", 42000, "passenger-km", "2026-01-22"],
    [hostelA._id, "waste", "landfill_mixed", 3400, "kg", "2026-01-27"],
    [hostelB._id, "waste", "recycled_paper", 900, "kg", "2026-01-28"],
    [cs._id, "electricity", "grid", 11400, "kWh", "2026-02-12"],
    [mech._id, "electricity", "grid", 15100, "kWh", "2026-02-13"],
    [admin._id, "transport", "diesel", 910, "litre", "2026-02-20"],
    [hostelA._id, "waste", "landfill_mixed", 3200, "kg", "2026-02-27"]
  ];

  for (const row of activityRows) {
    const [departmentId, category, subtype, quantity, unit, date] = row;
    const activity = await ActivityLog.create({
      organizationId: org._id,
      departmentId,
      category,
      subtype,
      quantity,
      unit,
      date: new Date(date),
      source: "system",
      createdBy: adminUser._id
    });
    await createEmissionRecord(activity, org.region);
  }

  await Benchmark.insertMany([
    { anonymizedName: "Peer College A", type: "college", region: "IN", population: 5200, annualTCO2e: 1820 },
    { anonymizedName: "Peer College B", type: "college", region: "IN", population: 3700, annualTCO2e: 1510 },
    { anonymizedName: "Peer College C", type: "college", region: "IN", population: 6100, annualTCO2e: 1960 },
    { anonymizedName: "Peer College D", type: "college", region: "IN", population: 4400, annualTCO2e: 1320 }
  ]);

  console.log("Seed complete");
  console.log("Login: admin@sih.local / Password123");
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
