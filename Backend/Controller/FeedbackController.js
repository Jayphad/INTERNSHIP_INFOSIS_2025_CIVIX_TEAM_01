const Feedback = require('../Models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    const { name, email, feedbackType, category, message, rating } = req.body;
    const images = req.files ? req.files.map(f => f.filename) : [];

    if (!feedbackType || !category || !message) {
      return res.status(400).json({
        success: false,
        message: "feedbackType, category, and message are required."
      });
    }

    // Save to MongoDB
    const feedback = await Feedback.create({
      user: req.user?._id || null,
      name: name || "Anonymous",
      email,
      feedbackType,
      category,
      message,
      rating: Number(rating) || 0,
      images
    });

    return res.json({
      success: true,
      message: "Feedback submitted!",
      feedback
    });

  } catch (err) {
    console.error("SAVE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while saving feedback",
      error: err.message
    });
  }
};
