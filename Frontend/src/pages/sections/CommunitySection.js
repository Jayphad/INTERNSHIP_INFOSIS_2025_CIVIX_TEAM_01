import React, { useState, useEffect } from "react";
import { FormButton } from "../FormControls";
import { MessageSquare, Calendar, Plus, MapPin, Heart, Send } from "../../assets/icons";
import "../../styles/Community.css";
import Modal from "./Modal";
import "../../styles/Modal.css";

const DiscussionCard = ({ discussion, onLike, onComment }) => {
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onComment(discussion._id, text);
      setText("");
    }
  };
console.log(discussion._id, discussion.likes, discussion.likedByMe);
console.log(discussion._id, "likedByMe:", discussion.likedByMe);


// console.log("Discussion ID:", discussion._id, "Likes:", discussion.likes, "isLiked:", isLiked, "likedByMe:", discussion.likedByMe);


  return (
    <div className="discussion-card">
      <div className="discussion-header">
        <div className="discussion-author-info">
          <div className="author-avatar">{discussion.authorAvatar}</div>
          <div>
            <h4 className="author-name">{discussion.authorName}</h4>
            <span className="post-time">
              {new Date(discussion.createdAt).toLocaleString()} • {discussion.category}
            </span>
          </div>
        </div>
      </div>

      <div className="discussion-content">
        <h3 className="discussion-title">{discussion.title}</h3>
        <p className="discussion-text">{discussion.content}</p>
      </div>

      <div className="discussion-footer">
        <button className="discussion-action-btn heart-icon" onClick={() => onLike(discussion._id)}>
      <Heart
          size={16}
          color={discussion.likedByMe ? "red" : "gray"}
          fill={discussion.likedByMe ? "red" : "none"}
        />
          &nbsp; {discussion.likes.length} Likes
        </button>


        <button className="discussion-action-btn" onClick={() => setShowInput(!showInput)}>
          <MessageSquare size={16} /> {discussion.comments.length} Comments
        </button>
      </div>

      {showInput && (
        <div className="comment-input-section">
          <div className="comments-display">
            {discussion.comments.map((c, i) => (
              <div key={i} className="single-comment">
                <strong>{c.author}:</strong> {c.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="comment-input-wrapper">
            <input
              className="comment-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
            />
            <button type="submit" className="btn-send-comment">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const CreatePostForm = ({ onCancel, onPost }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");

  const handleSubmit = (e) => {
    e.preventDefault();
    onPost({ title, content, category });
  };

  return (
    <form onSubmit={handleSubmit} className="petition-create-form petition-modal-form">
      <div className="form-field-group">
        <label>Title</label>
        <input
          type="text"
          placeholder="What's on your mind?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-field-group">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>General</option>
          <option>Events</option>
          <option>Policy</option>
          <option>Safety</option>
        </select>
      </div>

      <div className="form-field-group">
        <label>Content</label>
        <textarea
          rows="4"
          placeholder="Share details..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div className="form-action-buttons">
        <FormButton type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </FormButton>
        <FormButton type="submit" variant="primary">
          Post
        </FormButton>
      </div>
    </form>
  );
};

const CommunitySection = () => {
  const [discussions, setDiscussions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");

useEffect(() => {
  const fetchPosts = async () => {
    const res = await fetch("http://localhost:8080/community/all", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (data.success) {
      const userId = localStorage.getItem("id");
      const postsWithLikedByMe = data.posts.map(post => ({
        ...post,
        likedByMe: post.likes.map(id => id.toString()).includes(userId) // ✅ convert ObjectIds to string
      }));
      setDiscussions(postsWithLikedByMe);
    }
  };
  fetchPosts();
}, []);



  const handlePost = async (postData) => {
    const res = await fetch("http://localhost:8080/community/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(postData),
    });

    const data = await res.json();

    if (data.success) {
          setDiscussions((prev) => [data.post, ...prev]);  
          setIsModalOpen(false);
    }
  };
const handleLike = async (postId) => {
  const res = await fetch(`http://localhost:8080/community/like/${postId}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });

  const data = await res.json();

  if (data.success) {
    const userId = localStorage.getItem("id");
    setDiscussions(prev =>
      prev.map(post =>
        post._id === postId
          ? { 
              ...post, 
              likes: data.likes,
              likedByMe: data.likes.map(id => id.toString()).includes(userId)
            }
          : post
      )
    );
  }
};




  const handleComment = async (postId, text) => {
    const res = await fetch(`http://localhost:8080/community/comment/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (data.success) {
      setDiscussions((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, comments: data.comments } : post
        )
      );
    }
  };

  return (
    <div className="dashboard-section-placeholder">
      <div className="reports-section-header">
        <div>
          <h2 className="reports-section-title">Community</h2>
          <p className="reports-section-subtitle">
            Connect with neighbors, join discussions, and find local events.
          </p>
        </div>
        <div>
          <FormButton variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> New Post
          </FormButton>
        </div>
      </div>

      <div className="community-feed">
        <h3 className="section-heading">Recent Discussions</h3>

        <div className="discussions-list">
          {discussions.map((discussion) => (
            <DiscussionCard
              key={discussion._id}
              discussion={discussion}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a New Post">
        <CreatePostForm onCancel={() => setIsModalOpen(false)} onPost={handlePost} />
      </Modal>
    </div>
  );
};

export default CommunitySection;
