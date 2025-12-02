const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: "U" },

  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: "General" },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      author: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);
