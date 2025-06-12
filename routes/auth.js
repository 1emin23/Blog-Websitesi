const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Cache kontrol middleware'i
const noCache = (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
};

router.get("/login", noCache, (req, res) => {
  res.render("pages/login", {
    title: "Giriş Yap",
    loginError: null,
    email: null,
    user: req.session.user || null,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(
    "suan post: /login endpointinde ve email ve password degerleri",
    email,
    password
  );

  //* Email ve Password alanlarının bos deger kontrolu
  if (!email || !password)
    return res.render("pages/login", {
      title: "Giriş Yap",
      loginError: "Tum alanlar eksiksiz doldurulmalı!",
      email: email || null,
      user: req.session.user || null,
    });

  //* Girilen email adresi ile kullanıcının var olup olmadıgına bak
  const user = await User.findOne({ email });

  if (!user)
    return res.render("pages/login", {
      title: "Giriş Yap",
      loginError:
        "Kullanıcı bulunamadı! Bilgilerinizi dogru girdigizden emin olun",
      email: email || null,
      user: req.session.user || null,
    });

  //* Girilen email adresi ile bir kullanıcı bulundu ? Şifresini kontrol et
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.render("pages/login", {
      title: "Giriş Yap",
      email: email,
      loginError: "Sifre hatalı",
      user: req.session.user || null,
    });

  //* Kullanıcı email ve sifresi dogru. Session'a bilgilerini kaydet
  req.session.user = {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.user_role,
  };
  console.log("kullanıcı session'a kaydedildi", req.session.user);

  //* Admin ise admin sayfasına yonlendir
  if (user.user_role === "admin") return res.redirect("/dashboard");

  return res.redirect("/");
});

router.get("/register", noCache, (req, res) => {
  res.render("pages/register", {
    title: "Kayıt Ol",
    registerError: null,
    username: null,
    user: req.session.user || null,
  });
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  //* Gelen bütün input alanları eksiksiz olmalı
  if (!username || !email || !password)
    return res.render("pages/register", {
      title: "Kayıt Ol",
      registerError: "Tum alanlar eksiksiz doldurulmalı",
      username: username || null,
      user: req.session.user || null,
    });

  //* Email adresi zaten kullanımda olabilir
  const user = await User.findOne({ email });
  if (user)
    return res.render("pages/register", {
      title: "Kayıt Ol",
      registerError: "Bu email hesabı zaten kullanımda",
      username,
      user: req.session.user || null,
    });

  //* Password degeri veritabanına kaydedilmeden once hashlenmeli
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    //* User session'a kaydedilmeli
    req.session.user = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.user_role,
    };
    console.log("session bilgileri", req.session.user);

    return res.redirect("/");
  } catch (error) {
    console.log("user olustururken veritabanı hata verdi: ", error);
    return res.render("pages/register", {
      title: "Kayıt Ol",
      registerError:
        "Veritabanına kaydederken bir hata olustu yeniden deneyiniz",
      username: username || null,
      user: req.session.user || null,
    });
  }
});

router.get("/logout", (req, res) => {
  if (req.session) {
    console.log(
      req.session.user?.username,
      "adlı kullanıcı cıkıs yaptı bile...."
    );
    req.session.destroy(() => {
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
