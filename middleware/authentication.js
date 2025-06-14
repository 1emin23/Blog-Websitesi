function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).redirect("/auth/login");
}

function ensureAuthAPI(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res
    .status(401)
    .json({ message: "giris yapmalısnız", redirect: "/auth/login" });
}
module.exports = { ensureAuth, ensureAuthAPI };
