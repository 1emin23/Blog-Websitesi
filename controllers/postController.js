const Post = require("../models/Post");
exports.home = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  return res.render("pages/home", {
    title: "Anasayfa",
    posts,
    user: req.session.user || null,
  });
};

exports.detail = async (req, res) => {
  const postId = req.params.id.slice(0);
  console.log("detail route:", postId);
  console.log("detail route erisen kisi:", req.session.user);
  if (!postId) return res.send("Id alanı belirtilmemis");
  const post = await Post.findById({ _id: postId });
  if (!post) return res.send(`post with id: ${postId} not found`);
  return res.render("pages/postDetail", { title: "Detail Sayfası", post });
};
