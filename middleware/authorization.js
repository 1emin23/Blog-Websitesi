function ensureAdmin(req, res, next) {
  if (req.session?.user?.role === "admin") {
    console.log("current user is admin and tries to acces a protected route");
    return next();
  }

  res.status(403).redirect("/");
}
module.exports = { ensureAdmin };
