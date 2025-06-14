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
  // databaseden yorumları cekicez
  const postId = req.params.id.slice(0);
  if (!postId) return res.send("Id alanı belirtilmemis");
  const post = await Post.findById({ _id: postId });
  if (!post) return res.send(`post with id: ${postId} not found`);
  // postun yorumlarını da çekmek istiyoruz
  const comments = await Post.find({ _id: postId }).sort({
    createdAt: -1,
  });
  return res.render("pages/postDetail", {
    title: "Detail Sayfası",
    post,
    comments,
    user: req.session.user || null,
  });
};
