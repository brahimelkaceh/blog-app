const express = require("express");
const {
  createBlog,
  getAllBlogs,
  getBlog,
  deleteBlog,
  editBlog,
  viewEditPage,
} = require("../controllers/blogController");

const { logger } = require("../middelwares/logger");
const { upload } = require("../middelwares/imageStore");

const router = express.Router();

// ! Define routes and their corresponding controller functions
router.route("/").post(logger, upload.single("image"), createBlog);
router.route("/allBlogs").get(logger, getAllBlogs);
router.route("/allBlogs/:id").get(logger, getBlog);
router.route("/allBlogs/delete/:id").get(logger, deleteBlog);
router
  .route("/allBlogs/editBlog/:id")
  .get(logger, viewEditPage)
  .post(logger, upload.single("blogImage"), editBlog);

module.exports = router;
