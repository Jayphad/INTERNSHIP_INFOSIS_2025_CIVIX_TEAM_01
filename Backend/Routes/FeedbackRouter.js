const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../Middleware/authMiddleware");
const Feedback = require("../Models/Feedback");

// -------- MULTER UPLOAD --------
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


// ----------------------------------------------
// ✅ 1) SUBMIT FEEDBACK (already working)
// ----------------------------------------------
router.post("/submit", authMiddleware, upload.array("images", 4), async (req, res) => {
  try {
    const { name, email, feedbackType, category, message, rating } = req.body;
    const images = req.files ? req.files.map(f => f.filename) : [];

    const feedback = await Feedback.create({
      user: req.user?._id || null,
      name: name || "Anonymous",
      email,
      feedbackType,
      category,
      message,
      rating: Number(rating) || 0,
      status: "unread",
      images
    });

    return res.json({ success: true, feedback });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------------------------------------
// ✅ 2) GET ALL FEEDBACK
// ----------------------------------------------
router.get("/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return res.json({ success: true, feedbacks });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------------------------------------
// ✅ 3) DELETE FEEDBACK
// ----------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------------------------------------
// ✅ 4) TOGGLE READ / UNREAD
// ----------------------------------------------
router.patch("/:id/toggle", async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.json({ success: false, message: "Feedback not found" });

    fb.status = fb.status === "unread" ? "read" : "unread";
    await fb.save();

    return res.json({ success: true, status: fb.status });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});



router.put('/mark-read/:id', async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.json({ success: true, message: "Marked as read", feedback: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
