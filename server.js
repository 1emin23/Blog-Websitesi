const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const env = require("dotenv");

env.config();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Express-session ile kullanıcı oturumunu gerceklestiricez
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 saatlik oturum
  })
);

// Her sayfaya kullanıcı bilgisini gönder
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

// 📁 Rotalar
app.use("/", require("./routes/index"));
app.use("/", require("./routes/auth"));
app.use("/dashboard", require("./routes/admin"));
app.use("/user", require("./routes/user"));

// 404 Hata Middleware'i
app.use((req, res, next) => {
  res.status(404).render("pages/noPage", {
    title: "Sayfa Bulunamadı",
    user: req.session.user || null,
  });
});

// DB bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) =>
    console.log("Veritabanına baglanırken bir hata olustu: ", err)
  );
