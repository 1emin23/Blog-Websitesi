const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User.js");
const { ensureAuth } = require("../middleware/authentication.js");

router.get("/settings", ensureAuth, (req, res) => {
  console.log("settings sayfasındayız");
  const user = req.session.user;
  return res.render("pages/settings.ejs", { title: "Settings", user: user });
});

router.post("/settings", ensureAuth, async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  console.log("user/settings: req.body:", req.body);

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

module.exports = router;
