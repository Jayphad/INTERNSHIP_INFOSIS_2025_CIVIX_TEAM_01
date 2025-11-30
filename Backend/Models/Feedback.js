const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  email: { type: String },
  feedbackType: { type: String, required: true },
  category: { type: String, required: true },
  message: { type: String, required: true },
  rating: { type: Number, default: 0 },
  images: [{ type: String }], // store image URLs or filenames
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
