const User = require("../models/User.js");

async function ensureAdmin(req, res, next) {
  const user = await User.findById(req.session.user.id);
  if (user?.user_role === "admin") {
    return next();
  }

  res.status(403).redirect("/");
}
module.exports = { ensureAdmin };
