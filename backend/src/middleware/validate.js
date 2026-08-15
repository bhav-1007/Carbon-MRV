import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const message = result
    .array()
    .map((item) => `${item.path}: ${item.msg}`)
    .join("; ");

  return next(new ApiError(400, "VALIDATION_ERROR", message));
}
