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
        const storedData = localStorage.getItem('civix_feedback_data');
        if (storedData) {
            setFeedbacks(JSON.parse(storedData));
        }
    }, []);

    // Helper: Delete Feedback
    const handleDelete = (id) => {
        if(window.confirm("Are you sure you want to delete this feedback?")) {
            const updated = feedbacks.filter(f => f.id !== id);
            setFeedbacks(updated);
            localStorage.setItem('civix_feedback_data', JSON.stringify(updated));
            if (selectedFeedback?.id === id) setSelectedFeedback(null);
        }
    };

    // Helper: Mark as Read/Unread
    const toggleReadStatus = (id) => {
        const updated = feedbacks.map(f => 
            f.id === id ? { ...f, status: f.status === 'unread' ? 'read' : 'unread' } : f
        );
        setFeedbacks(updated);
        localStorage.setItem('civix_feedback_data', JSON.stringify(updated));
        
        // Update selected view if open
        if (selectedFeedback?.id === id) {
            setSelectedFeedback(prev => ({ ...prev, status: prev.status === 'unread' ? 'read' : 'unread' }));
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
            {/* --- Stats Header --- */}
            <div className="feedback-stats-row">
                <div className="stat-card">
                    <span className="stat-label">Total Feedback</span>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-card urgent">
                    <span className="stat-label">Unread</span>
                    <span className="stat-value">{stats.unread}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Bug Reports</span>
                    <span className="stat-value">{stats.bugs}</span>
                </div>
                <div className="stat-card">
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
                                    key={item.id} 
                                    className={`feedback-item-card ${selectedFeedback?.id === item.id ? 'active' : ''} ${item.status}`}
                                    onClick={() => setSelectedFeedback(item)}
                                >
                                    <div className="card-top">
                                        <span className={`badge ${item.feedbackType}`}>{item.feedbackType.replace('_', ' ')}</span>
                                        <span className="card-date">{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="card-subject">{item.category}</h4>
                                    <p className="card-snippet">{item.message.substring(0, 50)}...</p>
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
                                        <Clock size={14}/> {new Date(selectedFeedback.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-actions">
                                    <button 
                                        className="action-btn" 
                                        onClick={() => toggleReadStatus(selectedFeedback.id)}
                                        title={selectedFeedback.status === 'unread' ? "Mark as Read" : "Mark as Unread"}
                                    >
                                        <CheckCircle size={18} color={selectedFeedback.status === 'read' ? 'green' : '#666'} />
                                    </button>
                                    <button 
                                        className="action-btn delete" 
                                        onClick={() => handleDelete(selectedFeedback.id)}
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
                                <div className="detail-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < selectedFeedback.rating ? "#FFD700" : "#eee"} stroke="none" />
                                    ))}
                                </div>
                            </div>

                            <div className="detail-body">
                                <label>Category: <strong>{selectedFeedback.category}</strong></label>
                                <div className="message-box">
                                    {selectedFeedback.message}
                                </div>
                            </div>

                            {selectedFeedback.imageNames && selectedFeedback.imageNames.length > 0 && (
                                <div className="detail-attachments">
                                    <h4>Attachments ({selectedFeedback.imageNames.length})</h4>
                                    <div className="attachment-list">
                                        {selectedFeedback.imageNames.map((name, idx) => (
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