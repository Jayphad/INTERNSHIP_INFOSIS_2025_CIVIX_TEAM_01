const CommunityPost = require("../Models/CommunityPost");


// CREATE POST
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const post = await CommunityPost.create({
      user: req.user._id,
      authorName: req.user.email.split("@")[0],
      authorAvatar: req.user.email[0].toUpperCase(),
      title,
      content,
      category
    });

    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ALL POSTS
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// LIKE / UNLIKE
exports.toggleLike = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const userId = req.user._id.toString();

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes,    // <-- MUST return array
      likedByUser: post.likes.includes(userId)
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    post.comments.push({
      user: req.user._id,
      author: req.user.email.split("@")[0],
      text,
    });

    await post.save();

    res.json({ success: true, comments: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE POST
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    await CommunityPost.findByIdAndDelete(postId);

    res.json({ success: true, message: "Post deleted successfully" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
