import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Only for credentials
  image: String,
  role: { type: String, default: "admin" }, // 'user' or 'admin'
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
