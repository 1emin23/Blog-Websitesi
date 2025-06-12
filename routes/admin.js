const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { ensureAdmin } = require("../middleware/authorization");

router.get("/", ensureAdmin, async (req, res) => {
  const posts = await Post.find({ author: req.session.user._id }).sort({
    createdAt: -1,
  });
  res.render("pages/dashboard", { title: "Yönetim Paneli", posts });
});

router.get("/create", ensureAdmin, (req, res) => {
  res.render("pages/createPost", { title: "Yeni Yazı", createError: null });
});

router.post("/create", ensureAdmin, async (req, res) => {
  const { title, content } = req.body;

  //* title ve content degerlerinin kontrolu
  if (!title || !content)
    return res.render("pages/createPost", {
      title: "Yeni Yazı",
      createError: "Tum alanları eksiksiz doldurun lutfen",
    });

  try {
    const post = await Post.create({
      title,
      content,
      author: req.session.user.id,
    });
    console.log("kaydedilen post", post);
    return res.redirect("/dashboard");
  } catch (error) {
    console.log("post'u veritabanına kaydederken bir hata olustu: ", error);
    return res.redirect("/dashboard/create");
  }
});

router.get("/edit/post/:id", ensureAdmin, async (req, res) => {
  console.log(
    "/dashboard/post/edit/:id endpointin içindesin ve ensureAdmin middleware calısıcak"
  );
  const postId = req.params.id.slice(0);
  if (!postId) return res.redirect("/dashboard");
  const post = await Post.findById(postId);
  res.render("pages/editPost", { title: post.title, post });
});

router.post("/edit/post/:id", ensureAdmin, async (req, res) => {
  const postId = req.params.id.slice(0);
  const { title, content } = req.body;

  if (!postId) return res.redirect("/dashboard");
  try {
    await Post.findByIdAndUpdate(
      { _id: postId },
      { title, content },
      { new: true }
    );
    return res.redirect("/dashboard");
  } catch (error) {
    console.log("update ederken veritabanında bir hata cıktı: ", error);
    return res.redirect("/dashboard");
  }
});

// Delete post
router.delete("/delete/post/:id", ensureAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
