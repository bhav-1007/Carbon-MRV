import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Organization } from "../models/Organization.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

function sign(user) {
  return jwt.sign({ sub: user._id, role: user.role, organizationId: user.organizationId }, env.jwtSecret, { expiresIn: "7d" });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, organizationName, organizationType = "college" } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "EMAIL_EXISTS", "Email already registered");

  const org = await Organization.create({
    name: organizationName,
    type: organizationType,
    departments: [
      { name: "Computer Science", type: "department", population: 420 },
      { name: "Administration", type: "department", population: 80 },
      { name: "Hostel A", type: "hostel", population: 300 }
    ]
  });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: "admin", organizationId: org._id });

  res.status(201).json({ token: sign(user), user: { id: user._id, name, email, role: user.role, organizationId: org._id } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  res.json({ token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId, departmentId: user.departmentId } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
