import React, { useState, useEffect } from 'react';
import { Trash2, Shield, MessageSquare, Plus, X, Heart, Send } from '../../assets/icons';
import '../../styles/Dashboard.css';
import '../../styles/AdminCommunity.css';
import '../../styles/Community.css';

const AdminCommunitySection = () => {
  const [discussions, setDiscussions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Official Update');

  // Comment Input State
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [adminCommentText, setAdminCommentText] = useState('');

  // Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:8080/community/all", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (data.success) {
          const mapped = data.posts.map(p => ({
            ...p,
            author: p.authorName,
            avatar: p.authorAvatar,
            isAdmin: true // assume admin posts for now
          }));
          setDiscussions(mapped);
        }
      } catch (err) {
        console.log("Error loading posts:", err);
      }
    };
    fetchPosts();
  }, []);

  // --- Actions ---

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const newPost = { title: newTitle, content: newContent, category: newCategory };

    const res = await fetch("http://localhost:8080/community/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(newPost)
    });
    const data = await res.json();
    if (data.success) {
      const post = { ...data.post, author: data.post.authorName, avatar: data.post.authorAvatar, isAdmin: true };
      setDiscussions([post, ...discussions]);
      setShowCreateForm(false);
      setNewTitle('');
      setNewContent('');
    } else alert("Failed to create post");
  };

  const handleDelete = async (postId) => {
    const res = await fetch(`http://localhost:8080/community/delete/${postId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await res.json();
    if (data.success) setDiscussions(discussions.filter(post => post._id !== postId));
  };

  const handleLike = async (postId) => {
    const res = await fetch(`http://localhost:8080/community/like/${postId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await res.json();
    if (data.success) {
      setDiscussions(prev =>
        prev.map(post =>
          post._id === postId ? { ...post, likes: data.likes, adminLiked: data.likedByUser } : post
        )
      );
    }
  };

  const handleSubmitComment = async (postId) => {
    if (!adminCommentText.trim()) return;

    const res = await fetch(`http://localhost:8080/community/comment/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ text: adminCommentText })
    });
    const data = await res.json();
    if (data.success) {
      setDiscussions(prev =>
        prev.map(post =>
          post._id === postId ? { ...post, comments: data.comments } : post
        )
      );
      setAdminCommentText('');
      setActiveCommentId(null);
    }
  };

  return (
    <div className="dashboard-section-placeholder">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">
          <Shield size={28} style={{ marginRight: '10px', color: '#3b034e' }} />
          Community Moderation
        </h2>
        {!showCreateForm && (
          <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
            <Plus size={18} /> New Official Post
          </button>
        )}
      </div>

      <div className="admin-comm-container">
        {/* Create Form */}
        {showCreateForm && (
          <div className="admin-create-wrapper">
            <div className="create-form-header">
              <h3>Create Official Update</h3>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowCreateForm(false)} />
            </div>
            <form onSubmit={handleCreatePost}>
              <input className="admin-form-input" placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <textarea className="admin-form-textarea" rows="3" placeholder="Content" value={newContent} onChange={e => setNewContent(e.target.value)} />
              <div className="admin-form-actions">
                <button type="submit" className="btn-primary">Post</button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-comm-list">
          {discussions.map(discussion => {
            const commentCount = discussion.comments ? discussion.comments.length : 0;
            return (
              <div key={discussion._id} className="admin-comm-card" style={discussion.isAdmin ? { borderLeftColor: '#ffd700', background: '#fffcf0' } : {}}>
                {/* Header */}
                <div className="comm-card-header">
                  <div className="comm-author-group">
                    <div className="comm-avatar" style={discussion.isAdmin ? { background: '#3b034e', color: 'white' } : {}}>
                      {discussion.avatar}
                    </div>
                    <div className="comm-meta">
                      <h4>{discussion.author} {discussion.isAdmin && <span className="admin-badge">ADMIN</span>}</h4>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(discussion._id)} className="btn-delete-post">
                    <Trash2 size={16} /> Remove
                  </button>
                </div>

                {/* Body */}
                <div className="comm-card-content">
                  <h3>{discussion.title}</h3>
                  <p>{discussion.content}</p>
                </div>

                {/* Footer / Actions */}
                <div className="comm-card-footer">
                  <div className="comm-footer-stats">
                    <button onClick={() => handleLike(discussion._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: discussion.adminLiked ? '#ef4444' : '#64748b' }}>
                      <Heart size={16} /> {discussion.likes.length} Likes
                    </button>
                    <button onClick={() => setActiveCommentId(activeCommentId === discussion._id ? null : discussion._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '15px', color: '#64748b' }}>
                      <MessageSquare size={16} /> {commentCount} Comments
                    </button>
                  </div>
                </div>

                {/* Admin Comment Section */}
                {activeCommentId === discussion._id && (
                  <div className="comment-input-section">
                    {discussion.comments && discussion.comments.length > 0 && (
                      <div className="comments-display">
                        {discussion.comments.map((c, i) => (
                          <div key={c._id || i} className="single-comment">
                            <strong style={c.author === 'Civix Admin' ? { color: '#ef4444' } : {}}>{c.author}:</strong> {c.text}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="comment-input-wrapper" style={{ marginTop: '10px' }}>
                      <input className="comment-input" placeholder="Reply as Admin..." value={adminCommentText} onChange={e => setAdminCommentText(e.target.value)} />
                      <button className="btn-send-comment" onClick={() => handleSubmitComment(discussion._id)}>
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminCommunitySection;
