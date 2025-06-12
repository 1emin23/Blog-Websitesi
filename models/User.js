const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    user_role: { type: String, enum: ["user", "admin"], default: "user" },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "User" }
);

module.exports = mongoose.model("User", userSchema);
