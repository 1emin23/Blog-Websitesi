const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdateDate: { type: Date },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }], // Varsayılan boş dizi
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
      { default: [] }, // Varsayılan boş dizi
    ],
  },
  { collection: "Post" }
);

// ✅ lastUpdateDate güncelleme middleware’i
postSchema.pre("findOneAndUpdate", function (next) {
  this.set({ lastUpdateDate: Date.now() });
  next();
});

module.exports = mongoose.model("Post", postSchema);
