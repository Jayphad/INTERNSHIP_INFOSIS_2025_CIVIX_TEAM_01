import axios from "axios";
import SvgStar from '../../components/SvgStar';
import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Trash2, 
    CheckCircle, 
    Filter, 
    Star, 
    Clock,
    User
} from '../../assets/icons'; // Ensure these icons exist in your assets
import '../../styles/AdminFeedback.css'; // We will create this CSS next

const AdminFeedbackSection = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filter, setFilter] = useState('all'); // all, unread, bug_report, suggestion
    const [selectedFeedback, setSelectedFeedback] = useState(null);

// Load data from LocalStorage on mount
useEffect(() => {
    fetch("http://localhost:8080/feedback/all")
        .then(res => res.json())
        .then(data => {
            console.log("🔥 FEEDBACK RESPONSE:", data);  // <--- ADD THIS

            if (data.success) {
                setFeedbacks(data.feedbacks);
            }
        })
        .catch(err => console.error("Error loading feedback:", err));
}, []);


    // Helper: Delete Feedback
  const handleDelete = (id) => {
    if(!window.confirm("Delete this feedback?")) return;

    fetch(`http://localhost:8080/feedback/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const updated = feedbacks.filter(f => f._id !== id);
            setFeedbacks(updated);
            if (selectedFeedback?._id === id) setSelectedFeedback(null);
        }
    });
};


    // Helper: Mark as Read/Unread
   const toggleReadStatus = (id) => {
fetch(`http://localhost:8080/feedback/${id}/toggle`, {
        method: "PATCH"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const updated = feedbacks.map(f =>
                f._id === id ? { ...f, status: data.status } : f
            );
            setFeedbacks(updated);

            if (selectedFeedback?._id === id) {
                setSelectedFeedback(prev => ({ ...prev, status: data.status }));
            }
        }
    });
};


//read unread 
const markAsRead = async (id) => {
  try {
    const res = await axios.put(`http://localhost:8080/api/feedback/mark-read/${id}`);
    
    // update UI after marking read
    setFeedbacks(prev =>
      prev.map(f => f._id === id ? { ...f, status: "read" } : f)
    );
    
  } catch (error) {
    console.error("Mark read error:", error);
  }
};



    // Filter Logic
    const filteredFeedbacks = feedbacks.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'unread') return item.status === 'unread';
        return item.feedbackType === filter;
    });

    // Stats Calculation
    const stats = {
        total: feedbacks.length,
        unread: feedbacks.filter(f => f.status === 'unread').length,
        bugs: feedbacks.filter(f => f.feedbackType === 'bug_report').length,
        avgRating: (feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (feedbacks.length || 1)).toFixed(1)
    };

    return (
        <div className="admin-feedback-container">
            <div className="dashboard-section-header admin-comm-section-header">
                <div> 
                    <h2 className="dashboard-section-title">
                        Feedback Management
                    </h2>
                    <p className="dashboard-section-subtitle">
                        Review and manage user feedback effectively.
                    </p>
                </div>
            </div>
            <div className="feedback-stats-row">
                <div className="stat-card feed-stat-card" >
                    <span className="stat-label">Total Feedback</span>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-card feed-stat-card urgent">
                    <span className="stat-label">Unread</span>
                    <span className="stat-value">{stats.unread}</span>
                </div>
                <div className="stat-card feed-stat-card">
                    <span className="stat-label">Bug Reports</span>
                    <span className="stat-value">{stats.bugs}</span>
                </div>
                <div className="stat-card feed-stat-card">
                    <span className="stat-label">Avg Rating</span>
                    <span className="stat-value">★ {stats.avgRating}</span>
                </div>
            </div>

            <div className="feedback-main-content">
                {/* --- Left Sidebar: List --- */}
                <div className="feedback-list-panel">
                    <div className="list-filters">
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Feedback</option>
                            <option value="unread">Unread Only</option>
                            <option value="bug_report">Bug Reports</option>
                            <option value="suggestion">Suggestions</option>
                            <option value="complaint">Complaints</option>
                        </select>
                        <span className="list-count">{filteredFeedbacks.length} results</span>
                    </div>

                    <div className="feedback-items-scroll">
                        {filteredFeedbacks.length === 0 ? (
                            <div className="no-data">No feedback found.</div>
                        ) : (
                            filteredFeedbacks.map(item => (
                                <div 
                                   key={item._id}
                                            onClick={() => setSelectedFeedback(item)}
                                            className={`feedback-item-card ${selectedFeedback?._id === item._id ? 'active' : ''}`}

                                >
                                    <div className="card-top">
                                        <span className={`badge ${item.feedbackType}`}>{item.feedbackType.replace('_', ' ')}</span>
                                        <span className="card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                        <h4 className="card-subject">{item.category || "No Category"}</h4>
                                    <p className="card-snippet">{item.message.substring(0, 50)}...</p>
                                   <div className="card-rating" aria-hidden>
                                        {[...Array(5)].map((_, i) => (
                                            <SvgStar
                                            key={i}
                                            size={14}
                                            filled={i < Number(item.rating ?? 0)}
                                            className="star-icon"
                                            />
                                        ))}
                                        </div>

                                    <div className="card-footer">
                                        <small>{item.name}</small>
                                        {item.status === 'unread' && <div className="unread-dot"></div>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- Right Panel: Detail View --- */}
                <div className="feedback-detail-panel">
                    {selectedFeedback ? (
                        <div className="detail-content">
                            <div className="detail-header">
                                <div className="detail-meta">
                                    <span className={`badge large ${selectedFeedback.feedbackType}`}>
                                        {selectedFeedback.feedbackType.replace('_', ' ')}
                                    </span>
                                    <span className="detail-date">
                                        <Clock size={14}/> {new Date(selectedFeedback.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-actions">
                                    <button 
                                        className="action-btn" 
                                        onClick={() => toggleReadStatus(selectedFeedback._id)}
                                        title={selectedFeedback.status === 'unread' ? "Mark as Read" : "Mark as Unread"}
                                    >
                                        <CheckCircle
                                            className="action-icon"
                                            onClick={() => markAsRead(selectedFeedback._id)}
                                            size={18}
                                            color={selectedFeedback.status === 'read' ? 'green' : '#666'}
                                        />
                                    </button>
                                    <button 
                                        className="action-btn delete" 
                                        onClick={() => handleDelete(selectedFeedback._id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="detail-user-info">
                                <div className="user-avatar-placeholder">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3>{selectedFeedback.name}</h3>
                                    <p>{selectedFeedback.email}</p>
                                    <p className="user-type">User Account: {selectedFeedback.user}</p>
                                </div>
                              <div className="detail-rating" aria-label={`Rating ${Number(selectedFeedback?.rating ?? 0)} out of 5`}>
                                    {(() => {
                                        const ratingValue = Number(selectedFeedback?.rating ?? 0);
                                        return [...Array(5)].map((_, i) => (
                                        <SvgStar
                                            key={i}
                                            size={16}
                                            filled={i < ratingValue}
                                            className="star-icon"
                                        />
                                        ));
                                    })()}
                                    </div>



                            </div>

                            <div className="detail-body">
                                <label>Category: <strong>{selectedFeedback.category}</strong></label>
                                <div className="message-box">
                                    {selectedFeedback.message}
                                </div>
                            </div>

                            {selectedFeedback.images && selectedFeedback.images.length > 0 && (
                                <div className="detail-attachments">
                                    <h4>Attachments ({selectedFeedback.images.length})</h4>
                                    <div className="attachment-list">
                                        {selectedFeedback.images.map((name, idx) => (
                                            <div key={idx} className="attachment-item">
                                                <span className="file-icon">🖼️</span> {name}
                                            </div>
                                        ))}
                                    </div>
                                    <small className="note">* Images stored on server (Names shown for demo)</small>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="empty-selection">
                            <MessageSquare size={48} color="#ccc" />
                            <p>Select a feedback item to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminFeedbackSection;