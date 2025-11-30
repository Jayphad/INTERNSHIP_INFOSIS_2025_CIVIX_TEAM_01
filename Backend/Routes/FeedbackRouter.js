const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");



// Import middleware and controller
const authMiddleware = require("../Middleware/authMiddleware");

const { submitFeedback } = require("../Controller/FeedbackController");

// ✅ Debugging: check if they are properly imported
console.log("submitFeedback:", submitFeedback);
console.log("authMiddleware:", authMiddleware);

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/feedback");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST feedback route
router.post("/submit", authMiddleware, upload.array("images", 4), submitFeedback);



module.exports = router;
