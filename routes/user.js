const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User.js");
const Post = require("../models/Post.js");
const {
  ensureAuth,
  ensureAuthAPI,
} = require("../middleware/authentication.js");

router.get("/settings", ensureAuth, (req, res) => {
  const user = req.session.user;
  return res.render("pages/settings.ejs", { title: "Settings", user: user });
});

router.post("/settings", ensureAuth, async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // TODO: check if two password fields match
  if (password !== confirmPassword)
    return res.render("pages/settings", {
      title: "Settings",
      passwordMatchError: "Sifreler birbiriyle uyusmuyor",
    });

  if (password === "") {
    console.log("yeyyy, kullanıcı sifre yenilemek istemedi");
    return res.redirect("/");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  console.log("new password: ", password, "hashlenmis hali: ", hashPassword);
  try {
    await User.findOneAndUpdate({ email }, { password: hashPassword });
    return res.redirect("/");
  } catch (error) {
    console.log("veritabanına guncelleme islemi yaparken hata cıktı", error);
    return res.redirect("/settings");
  }
});

router.get("/profile", ensureAuth, async (req, res) => {
  // Database'den begenlenleri ve yorum yapılanları getir
  const userId = req.session.user.id;
  const likedPosts = await Post.find({ likes: userId }).lean();
  const commentedPosts = await Post.find({ "comments.user": userId }).lean();
  console.log("likedPosts, commentedPosts:", likedPosts, commentedPosts);

  return res.render("pages/profile.ejs", {
    likedPosts: likedPosts || null,
    commentedPosts: commentedPosts || null,
    title: "Profile",
    user: req.session.user,
  });
});

router.post("/post/like/:id", ensureAuthAPI, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user.id;

    // Gönderiyi bul
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Gönderi bulunamadı" });
    }

    //TODO:su isleme gerek var mı kullanıcı begenmisse zaten delete fetch atiliyor buraya degilki....
    if (post.likes.includes(userId)) {
      return res.status(400).json({ error: "Bu gönderiyi zaten beğendiniz" });
    }

    // Gönderiye beğeni ekle
    post.likes.push(userId);
    await post.save();

    // Kullanıcının beğendiği gönderilere ekle (opsiyonel)
    const user = await User.findById(userId);
    user.likedPosts.push(postId);
    await user.save();

    return res
      .status(200)
      .json({ message: "Gönderi beğenildi", likes: post.likes.length });
  } catch (error) {
    console.error("Beğenme hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

router.delete("/post/like/:id", ensureAuthAPI, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user.id;

    // Gönderiyi bul
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Gönderi bulunamadı" });
    }
    // Kullanıcı beğeniyi kaldırmış mı?
    if (!post.likes.includes(userId)) {
      console.log("kullanıcı daha once de begeniyi kaldırmıs");
      return res.status(400).json({ error: "Bu gönderiyi beğenmediniz" });
    }

    // Beğeniyi kaldır
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    await post.save();

    // Kullanıcının beğendiği gönderilerden kaldır (opsiyonel)
    const user = await User.findById(userId);
    user.likedPosts = user.likedPosts.filter(
      (id) => id.toString() !== postId.toString()
    );
    await user.save();

    return res
      .status(200)
      .json({ message: "Beğeni kaldırıldı", likes: post.likes.length });
  } catch (error) {
    console.error("Beğeni kaldırma hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

router.post("/comment/:postId", ensureAuthAPI, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body; // Destructure content from req.body

    if (!postId || !content) {
      return res
        .status(400)
        .json({ message: "Gönderi ID veya yorum içeriği eksik" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Gönderi bulunamadı" });
    }

    // Add new comment
    post.comments.push({
      user: req.session.user.id,
      username: req.session.user.username || username,
      content: content.trim(),
    });

    await post.save();

    res.json({ success: true, message: "Yorum eklendi" });
  } catch (error) {
    console.error("Yorum ekleme hatası:", error);
    res.status(500).json({ message: "Yorum eklenemedi" });
  }
});

router.delete(
  "/post/comment/:postId/:commentId",
  ensureAuthAPI,
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const userId = req.session.user._id;

      // Gönderiyi bul
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Gönderi bulunamadı" });
      }

      // Yorumu bul ve kullanıcı kontrolü yap
      const comment = post.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Yorum bulunamadı" });
      }
      if (comment.user.toString() !== userId.toString()) {
        return res.status(403).json({ error: "Bu yorumu silme yetkiniz yok" });
      }

      // Yorumu kaldır
      post.comments = post.comments.filter(
        (c) => c._id.toString() !== commentId
      );
      await post.save();

      return res.status(200).json({ message: "Yorum silindi" });
    } catch (error) {
      console.error("Yorum silme hatası:", error);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  }
);
module.exports = router;
