const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdateDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { collection: "Post" }
);

// ✅ lastUpdateDate güncelleme middleware’i
postSchema.pre("findOneAndUpdate", function (next) {
  this.set({ lastUpdateDate: Date.now() });
  next();
});

module.exports = mongoose.model("Post", postSchema);
