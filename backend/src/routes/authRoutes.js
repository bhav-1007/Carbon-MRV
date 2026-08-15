import { Router } from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const authRoutes = Router();

authRoutes.post("/register", [
  body("name").isString().isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("organizationName").isString().isLength({ min: 2 })
], validate, register);

authRoutes.post("/login", [
  body("email").isEmail(),
  body("password").isString().notEmpty()
], validate, login);

authRoutes.get("/me", requireAuth, me);
