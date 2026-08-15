import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "UNAUTHORIZED", "Missing bearer token");

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) throw new ApiError(401, "UNAUTHORIZED", "Invalid session");

    req.user = user;
    req.organizationId = user.organizationId;
    return next();
  } catch (err) {
    return next(err.statusCode ? err : new ApiError(401, "UNAUTHORIZED", "Invalid token"));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "FORBIDDEN", "Insufficient permissions"));
    }
    return next();
  };
}
