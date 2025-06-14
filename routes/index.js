const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController.js");

router.get("/", postController.home);
router.get("/post/detail/comments/:id", postController.detail);

module.exports = router;
