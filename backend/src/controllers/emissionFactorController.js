import { EmissionFactor } from "../models/EmissionFactor.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginated } from "../utils/pagination.js";

export const listFactors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const result = await paginated(EmissionFactor, filter, req, { sort: { category: 1, subtype: 1, effectiveFrom: -1 } });
  res.json(result);
});

export const createFactor = asyncHandler(async (req, res) => {
  const factor = await EmissionFactor.create(req.body);
  res.status(201).json({ factor });
});

export const updateFactor = asyncHandler(async (req, res) => {
  const factor = await EmissionFactor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ factor });
});
