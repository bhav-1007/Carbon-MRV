import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "sustainability_officer", "department_user", "viewer"], default: "department_user" },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
