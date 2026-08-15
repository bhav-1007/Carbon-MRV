import mongoose from "mongoose";
import { EmissionRecord } from "../models/EmissionRecord.js";
import { Organization } from "../models/Organization.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function badgeFor(total) {
  if (total < 5) return "Net Zero Sprinter";
  if (total < 20) return "Low Carbon Leader";
  if (total < 50) return "Efficiency Builder";
  return "Action Needed";
}

export const leaderboard = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.organizationId);
  const totals = await EmissionRecord.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(req.organizationId) } },
    { $group: { _id: "$departmentId", total: { $sum: "$tCO2e" } } },
    { $sort: { total: 1 } }
  ]);

  const departments = org.departments || [];
  const items = totals.map((item, index) => {
    const department = departments.find((dept) => String(dept._id) === String(item._id));
    return {
      rank: index + 1,
      departmentId: item._id,
      departmentName: department?.name || "Unassigned",
      tCO2e: Number(item.total.toFixed(3)),
      badge: badgeFor(item.total)
    };
  });

  res.json({ items });
});
