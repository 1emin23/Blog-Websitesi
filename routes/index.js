const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController.js");

router.get("/", postController.home);
router.get("/post/detail/:id", postController.detail);

module.exports = router;
