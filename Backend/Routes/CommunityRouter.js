const express = require("express");
const router = express.Router();
const auth = require("../Middleware/AuthMiddleware");
const { 
  createPost, 
  getAllPosts,
  toggleLike,
  addComment ,
   deletePost
} = require("../Controller/CommunityController");



router.post("/create", auth, createPost);
router.get("/all", auth, getAllPosts);
router.post("/like/:postId", auth, toggleLike);
router.post("/comment/:postId", auth, addComment);
router.delete("/delete/:postId", auth, deletePost);


module.exports = router;
