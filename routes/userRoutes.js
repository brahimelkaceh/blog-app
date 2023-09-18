const express = require("express");
const {
  handleRegistration,
  handleLogin,
  renderLogin,
  handleLogout,
  dashboardController,
  renderRegister,
} = require("../controllers/userController");

const { upload } = require("../middelwares/imageStore");
const { logger } = require("../middelwares/logger");
const { handleError } = require("../middelwares/handleError");

const router = express.Router();

//! Define routes and their corresponding controller functions
router.route("/login").get(renderLogin).post(handleLogin);

router
  .route("/register")
  .get(renderRegister)
  .post(upload.single("image"), handleError, handleRegistration);

router.route("/logout").get(handleLogout);
router.route("/dashboard").get(logger, dashboardController);
module.exports = router;
