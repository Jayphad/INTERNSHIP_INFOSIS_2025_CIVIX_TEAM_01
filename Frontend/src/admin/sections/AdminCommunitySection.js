import React, { useState, useEffect } from 'react';
import { Trash2, Shield, MessageSquare, Clock, Activity, Plus, X, Check, Heart, Send } from '../../assets/icons'; // Ensure Heart/Send imported
import '../../styles/Dashboard.css';
import '../../styles/AdminCommunity.css';
import '../../styles/Community.css'; // Get the comment styles

const defaultDiscussions = [
  {
    id: 1,
    author: "Sarah Jenkins",
    avatar: "SJ",
    time: "2 hours ago",
    title: "Volunteers needed for park cleanup!",
    content: "Hi everyone! We're organizing a cleanup at Central Park.",
    likes: 12,
    commentsList: [],
    category: "Events"
  }
];

const AdminCommunitySection = () => {
  const [discussions, setDiscussions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Official Update');

  // Comment Input State
  const [activeCommentId, setActiveCommentId] = useState(null); // Which card is open for commenting
  const [adminCommentText, setAdminCommentText] = useState("");

  useEffect(() => {
    const savedData = localStorage.getItem('civix_community_posts');
    if (savedData) {
      setDiscussions(JSON.parse(savedData));
    } else {
      setDiscussions(defaultDiscussions);
      localStorage.setItem('civix_community_posts', JSON.stringify(defaultDiscussions));
    }
  }, []);

  const saveData = (newData) => {
      setDiscussions(newData);
      localStorage.setItem('civix_community_posts', JSON.stringify(newData));
  };

  // --- ACTIONS ---

  const handleCreatePost = (e) => {
      e.preventDefault();
      const newPost = {
          id: Date.now(),
          author: "Civix Admin",
          avatar: "🛡️",
          isAdmin: true,
          time: "Just now",
          title: newTitle,
          content: newContent,
          category: newCategory,
          likes: 0,
          commentsList: []
      };
      saveData([newPost, ...discussions]);
      setNewTitle(''); setNewContent(''); setShowCreateForm(false);
  };

  const handleDelete = (id) => {
    if(window.confirm("Remove this post?")) {
        saveData(discussions.filter(post => post.id !== id));
    }
  };

  const handleLike = (id) => {
      const updated = discussions.map(post => {
          if (post.id === id) {
              // Admin likes increase count, but we track 'adminLiked' separately to toggle
              const isLiked = post.adminLiked;
              return { 
                  ...post, 
                  likes: isLiked ? post.likes - 1 : post.likes + 1, 
                  adminLiked: !isLiked 
              };
          }
          return post;
      });
      saveData(updated);
  };

  const handleSubmitComment = (id) => {
      if(!adminCommentText.trim()) return;

      const updated = discussions.map(post => {
          if (post.id === id) {
              const currentList = post.commentsList || [];
              return {
                  ...post,
                  commentsList: [...currentList, { author: "Civix Admin", text: adminCommentText }]
              };
          }
          return post;
      });
      saveData(updated);
      setAdminCommentText("");
      setActiveCommentId(null); // Close input
  };

  return (
    <div className="dashboard-section-placeholder">
      <div className="dashboard-section-header">
        <div>
            <h2 className="dashboard-section-title">
                <Shield size={28} style={{marginRight:'10px', verticalAlign:'bottom', color: '#3b034e'}}/> 
                Community Moderation
            </h2>
        </div>
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
                <div className="create-form-header"><h3>Create Official Update</h3><X style={{cursor:'pointer'}} onClick={() => setShowCreateForm(false)}/></div>
                <form onSubmit={handleCreatePost}>
                    <input className="admin-form-input" style={{marginBottom:'10px'}} placeholder="Title" value={newTitle} onChange={(e)=>setNewTitle(e.target.value)}/>
                    <textarea className="admin-form-textarea" rows="3" placeholder="Content" value={newContent} onChange={(e)=>setNewContent(e.target.value)}/>
                    <div className="admin-form-actions"><button type="submit" className="btn-primary">Post</button></div>
                </form>
            </div>
        )}

        <div className="admin-comm-list">
            {discussions.map(discussion => {
                const commentCount = discussion.commentsList ? discussion.commentsList.length : (discussion.comments || 0);
                return (
                <div key={discussion.id} className="admin-comm-card" style={discussion.isAdmin ? {borderLeftColor: '#ffd700', background: '#fffcf0'} : {}}>
                    
                    {/* Header */}
                    <div className="comm-card-header">
                        <div className="comm-author-group">
                            <div className="comm-avatar" style={discussion.isAdmin ? {background:'#3b034e', color:'white'}:{}}>{discussion.avatar}</div>
                            <div className="comm-meta">
                                <h4>{discussion.author} {discussion.isAdmin && <span className="admin-badge">ADMIN</span>}</h4>
                                <span>{discussion.time}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(discussion.id)} className="btn-delete-post"><Trash2 size={16} /> Remove</button>
                    </div>
                    
                    {/* Body */}
                    <div className="comm-card-content">
                        <h3>{discussion.title}</h3>
                        <p>{discussion.content}</p>
                    </div>
                    
                    {/* Footer / Actions */}
                    <div className="comm-card-footer">
                        <div className="comm-footer-stats">
                             {/* Like Button */}
                             <button 
                                onClick={() => handleLike(discussion.id)}
                                style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', color: discussion.adminLiked ? '#ef4444' : '#64748b'}}
                             >
                                 <Heart size={16} className={discussion.adminLiked ? 'active-heart' : ''} />
                                 {discussion.likes} Likes
                             </button>

                             {/* Comment Toggle */}
                             <button 
                                onClick={() => setActiveCommentId(activeCommentId === discussion.id ? null : discussion.id)}
                                style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', marginLeft:'15px', color:'#64748b'}}
                             >
                                 <MessageSquare size={16} /> {commentCount} Comments
                             </button>
                        </div>
                        <div className="comm-id-badge">ID: {discussion.id}</div>
                    </div>

                    {/* Admin Comment Section */}
                    {activeCommentId === discussion.id && (
                        <div className="comment-input-section">
                            {/* View Comments */}
                            {discussion.commentsList && discussion.commentsList.length > 0 && (
                                <div className="comments-display">
                                    {discussion.commentsList.map((c, i) => (
                                        <div key={i} className="single-comment">
                                            <strong style={c.author === 'Civix Admin' ? {color:'#ef4444'} : {}}>{c.author}:</strong> {c.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Write Comment */}
                            <div className="comment-input-wrapper" style={{marginTop:'10px'}}>
                                <input 
                                    className="comment-input" 
                                    placeholder="Reply as Admin..." 
                                    value={adminCommentText}
                                    onChange={(e) => setAdminCommentText(e.target.value)}
                                />
                                <button className="btn-send-comment" onClick={() => handleSubmitComment(discussion.id)}>
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )})}
        </div>
      </div>
    </div>
  );
};

export default AdminCommunitySection;