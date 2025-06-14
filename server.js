const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const env = require("dotenv");
const MongoStore = require("connect-mongo");
const rateLimit = require("express-rate-limit");

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
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Üretim ortamında HTTPS kullan
    sameSite: "strict", // CSRF koruması için
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 saatlik oturum
  })
);
app.set("trust proxy", 1);
const limiter = rateLimit({
  windowMs: 5 * 1000, // 5 saniye
  max: 100, // 1 dakika içinde en fazla 100 istek yapılabilir
  handler: (req, res) => {
    res.status(429).render("pages/ratelimit", {
      title: "Çok Fazla İstek",
      message: `Çok fazla istek yaptınız. Lütfen 5 sn sonra tekrar deneyin.`,
      user: req.session?.user || null,
    });
  },
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// Her sayfaya kullanıcı bilgisini gönder
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

// 📁 Rotalar
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
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
