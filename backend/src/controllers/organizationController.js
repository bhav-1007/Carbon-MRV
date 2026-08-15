import { Organization } from "../models/Organization.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.organizationId);
  res.json({ organization });
});

export const updateMyOrganization = asyncHandler(async (req, res) => {
  const allowed = ["name", "type", "region", "campusSizeSqM", "studentCount", "employeeCount", "departments"];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const organization = await Organization.findByIdAndUpdate(req.organizationId, patch, { new: true, runValidators: true });
  res.json({ organization });
});
