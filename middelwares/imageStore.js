const multer = require("multer");

// ! Configure multer storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname;
    cb(null, Date.now() + ext);
  },
});

//! Create a multer middleware with the configured storage settings
exports.upload = multer({ storage: storage });
