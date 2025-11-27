// src/components/admin/AdminPollsSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Search, Filter, CheckCircle, XCircle, Trash2,
  BarChart2, Clock, Plus, X, Eye, Lock, AlertCircle, Edit2,
  Calendar, MapPin, MessageSquare
} from '../../assets/icons';
import '../../styles/AdminPolls.css';

const API_BASE = "http://localhost:8080/polls";

const AdminPollsSection = () => {
  const [polls, setPolls] = useState([]);
  const [activeView, setActiveView] = useState('polls'); // 'polls' | 'feedback'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewPoll, setViewPoll] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newPoll, setNewPoll] = useState({
    id: null,
    question: "",
    description: "",
    location: "",
    closesOn: "",
    options: [{ text: "" }, { text: "" }]
  });

  useEffect(() => {
    fetchPolls();
  }, []);

  // Fetch all polls from backend
  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/all`);
      if (res?.data?.success) {
        // normalize id to `id` from `_id` for consistent UI usage
        const normalized = res.data.data.map(p => ({ ...p, id: p._id }));
        setPolls(normalized);
      } else {
        console.warn("Failed to fetch polls:", res?.data);
      }
    } catch (err) {
      console.error("Error fetching polls:", err);
      alert("Failed to fetch polls from backend. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const getAdminId = () => localStorage.getItem("id") || 'admin';

  // Create or update poll (admin)
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const cleanOptions = newPoll.options.filter(o => o.text && o.text.trim() !== "");
    if (cleanOptions.length < 2) { alert("At least 2 options required."); return; }

    const payload = {
      question: newPoll.question,
      description: newPoll.description,
      location: newPoll.location,
      closesOn: newPoll.closesOn,
      options: cleanOptions.map((o, i) => ({ id: o.id || `opt_${Date.now()}_${i}`, text: o.text })),
      authorId: getAdminId(),
      authorName: 'Admin',
      status: newPoll.id ? undefined : "active" // new admin polls active by default
    };

    try {
      if (newPoll.id) {
        // update existing
        const res = await axios.put(`${API_BASE}/${newPoll.id}/update`, payload);
        if (res?.data?.success) {
          alert("Poll updated successfully.");
          await fetchPolls();
        } else {
          throw new Error(res?.data?.message || "Update failed");
        }
      } else {
        // create new
        const res = await axios.post(`${API_BASE}/create`, payload);
        if (res?.data?.success) {
          alert("Poll created successfully.");
          await fetchPolls();
        } else {
          throw new Error(res?.data?.message || "Create failed");
        }
      }
    } catch (err) {
      console.error("Create/Update error:", err);
      alert("Error creating/updating poll. Check console.");
    } finally {
      setIsCreateModalOpen(false);
      setNewPoll({ id: null, question: "", description: "", location: "", closesOn: "", options: [{ text: "" }, { text: "" }] });
    }
  };

  // Approve = set status active
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this poll (make it Active)?")) return;
    try {
      const res = await axios.put(`${API_BASE}/${id}/update`, { status: "active" });
      if (res?.data?.success) {
        alert("Poll approved.");
        await fetchPolls();
      } else {
        throw new Error(res?.data?.message || "Approve failed");
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("Failed to approve poll. Check console.");
    }
  };

  // Close poll
  const handleClose = async (id) => {
    if (!window.confirm("Close this poll? No more votes will be accepted.")) return;
    try {
      const res = await axios.post(`${API_BASE}/${id}/close`, { userId: getAdminId() });
      if (res?.data?.success) {
        alert("Poll closed.");
        await fetchPolls();
      } else {
        throw new Error(res?.data?.message || "Close failed");
      }
    } catch (err) {
      console.error("Close error:", err);
      alert("Failed to close poll. Check console.");
    }
  };

  // Delete poll
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this poll permanently?")) return;
    try {
      const res = await axios.post(`${API_BASE}/${id}/delete`, { userId: getAdminId() });
      if (res?.data?.success) {
        alert("Poll deleted.");
        await fetchPolls();
      } else {
        throw new Error(res?.data?.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete poll. Check console.");
    }
  };

  // open edit modal (populate)
  const openEditModal = (poll) => {
    setNewPoll({
      id: poll.id,
      question: poll.question || "",
      description: poll.description || "",
      location: poll.location || "",
      closesOn: poll.closesOn || "",
      options: (poll.options || []).map(o => ({ ...o }))
    });
    setIsCreateModalOpen(true);
  };

  const filteredPolls = useMemo(() => {
    return polls.filter(p => {
      const matchesSearch = (p.question || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' ? true : p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [polls, searchTerm, filterStatus]);

  const feedbackList = useMemo(() => {
    return polls.flatMap(poll =>
      (poll.feedback || []).map(f => ({
        ...f,
        pollQuestion: poll.question,
        pollId: poll.id
      }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [polls]);

  const stats = {
    total: polls.length,
    review: polls.filter(p => p.status === 'review').length,
    active: polls.filter(p => p.status === 'active').length,
    closed: polls.filter(p => p.status === 'closed').length
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-title">Manage Polls</h2>
          <p className="admin-page-subtitle">Moderate and create community polls.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="view-switcher">
            <button className={`view-btn ${activeView === 'polls' ? 'active' : ''}`} onClick={() => setActiveView('polls')}>Polls</button>
            <button className={`view-btn ${activeView === 'feedback' ? 'active' : ''}`} onClick={() => setActiveView('feedback')}>Feedback</button>
          </div>

          {activeView === 'polls' && (
            <button className="primary-btn" onClick={() => {
              setNewPoll({ id: null, question: "", description: "", location: "", closesOn: "", options: [{ text: "" }, { text: "" }] });
              setIsCreateModalOpen(true);
            }}>
              <Plus size={18} /> Create Poll
            </button>
          )}
        </div>
      </div>

      {activeView === 'polls' ? (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div style={{ background: '#e0f2fe', padding: '0.75rem', borderRadius: '.5rem', marginRight: '1rem' }}><BarChart2 size={24} color="#0284c7" /></div>
              <div><h3>{stats.total}</h3><p style={{ margin: 0, color: '#64748b' }}>Total</p></div>
            </div>
            <div className="admin-stat-card">
              <div style={{ background: '#fff7ed', padding: '0.75rem', borderRadius: '.5rem', marginRight: '1rem' }}><Clock size={24} color="#ea580c" /></div>
              <div><h3>{stats.review}</h3><p style={{ margin: 0, color: '#64748b' }}>Pending Review</p></div>
            </div>
            <div className="admin-stat-card">
              <div style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: '.5rem', marginRight: '1rem' }}><CheckCircle size={24} color="#16a34a" /></div>
              <div><h3>{stats.active}</h3><p style={{ margin: 0, color: '#64748b' }}>Active</p></div>
            </div>
            <div className="admin-stat-card">
              <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '.5rem', marginRight: '1rem' }}><Lock size={24} color="#475569" /></div>
              <div><h3>{stats.closed}</h3><p style={{ margin: 0, color: '#64748b' }}>Closed</p></div>
            </div>
          </div>

          <div className="admin-controls-bar">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search polls..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="filter-wrapper">
              <Filter size={18} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="review">Under Review</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Poll Details</th><th>Votes</th><th>Status</th><th>Closed</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                ) : filteredPolls.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.question}</div>
                      <div style={{ fontSize: '.8rem', color: '#64748b' }}>
                        {p.category || 'Community'} • Created: {new Date(p.createdAt).toLocaleDateString()} • By {p.authorName}
                      </div>
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: '#f3f4f6', color: '#374151' }}>
                        {p.totalVotes || 0} Votes
                      </span>
                    </td>
                    <td><span className={`status-pill ${p.status}`}>{p.status === 'review' ? 'Review' : p.status}</span></td>
                    <td>
                      <div style={{ fontSize: '.85rem', color: '#64748b' }}>
                        {p.closesOn ? new Date(p.closesOn).toLocaleDateString() : 'Open'}
                      </div>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button className="action-btn view" title="View Details" onClick={() => setViewPoll(p)}><Eye size={18} /></button>

                        <button
                          className="action-btn edit"
                          title={p.status === 'closed' ? "Cannot edit closed poll" : "Edit Poll"}
                          onClick={() => p.status !== 'closed' && openEditModal(p)}
                          disabled={p.status === 'closed'}
                        >
                          <Edit2 size={18} />
                        </button>

                        {p.status === 'review' && <button className="action-btn success" onClick={() => handleApprove(p.id)} title="Approve"><CheckCircle size={18} /></button>}
                        {p.status === 'active' && <button className="action-btn warning" onClick={() => handleClose(p.id)} title="Close"><XCircle size={18} /></button>}
                        <button className="action-btn danger" onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredPolls.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No polls found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead><tr><th>Type</th><th>Feedback Details</th><th>Related Poll</th><th>Date</th></tr></thead>
            <tbody>
              {feedbackList.length > 0 ? feedbackList.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={`feedback-type type-${item.type === 'Issue Report' ? 'issue' : item.type === 'Suggestion' ? 'suggestion' : 'other'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td><p style={{ margin: 0, maxWidth: '400px', lineHeight: 1.5 }}>{item.details}</p></td>
                  <td><div style={{ fontWeight: 600, color: '#475569', fontSize: '.85rem' }}>{item.pollQuestion}</div></td>
                  <td style={{ color: '#94a3b8', fontSize: '.85rem' }}>{new Date(item.date).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No feedback received yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {viewPoll && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="view-modal-header">
              <div>
                <h3 className="view-modal-title">Poll Details</h3>
                <div className="view-modal-meta">
                  <span className={`status-pill ${viewPoll.status}`}>{viewPoll.status}</span>
                  <span><MapPin size={14} style={{ display: 'inline' }} /> {viewPoll.location}</span>
                  <span><Clock size={14} style={{ display: 'inline' }} /> {viewPoll.closesOn ? `Closes ${new Date(viewPoll.closesOn).toLocaleDateString()}` : 'No Expiry'}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewPoll(null)}><X size={24} /></button>
            </div>

            <div className="view-section">
              <span className="view-label">Question</span>
              <p className="view-content" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{viewPoll.question}</p>
            </div>

            <div className="view-section">
              <span className="view-label">Description</span>
              <p className="view-content">{viewPoll.description || "No description provided."}</p>
            </div>

            <div className="view-section">
              <span className="view-label">Results ({viewPoll.totalVotes || 0} Votes)</span>
              <div style={{ marginTop: '.5rem' }}>
                {viewPoll.options.map(o => {
                  const votes = (viewPoll.results || {})[o.id] || 0;
                  const total = viewPoll.totalVotes || 1;
                  const pct = Math.round((votes / total) * 100);
                  return (
                    <div key={o.id} className="view-result-item">
                      <div className="view-result-label">
                        <span>{o.text}</span>
                        <span>{votes} votes ({pct}%)</span>
                      </div>
                      <div className="view-result-track">
                        <div className="view-result-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="view-footer">
              <span>Created: {new Date(viewPoll.createdAt).toLocaleString()}</span>
              <span>By: {viewPoll.authorName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{newPoll.id ? "Edit Poll" : "Create Admin Poll"}</h3>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="form-group">
                <label className="form-label">Question</label>
                <input className="form-input" required value={newPoll.question} onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })} placeholder="Ask the community..." />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows="3" value={newPoll.description} onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })} placeholder="Optional context..." />
              </div>
              <div className="form-group">
                <label className="form-label">Options</label>
                {newPoll.options.map((opt, idx) => (
                  <div key={idx} className="poll-option-row">
                    <input className="form-input" placeholder={`Option ${idx + 1}`} value={opt.text} onChange={(e) => {
                      const newOpts = [...newPoll.options]; newOpts[idx].text = e.target.value; setNewPoll({ ...newPoll, options: newOpts });
                    }} />
                    {newPoll.options.length > 2 && <button type="button" className="remove-opt-btn" onClick={() => {
                      setNewPoll({ ...newPoll, options: newPoll.options.filter((_, i) => i !== idx) });
                    }}><X size={18} /></button>}
                  </div>
                ))}
                {newPoll.options.length < 10 && <button type="button" className="add-opt-btn" onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, { text: "" }] })}><Plus size={16} /> Add Option</button>}
              </div>
              <div className="form-row">
                <div><label className="form-label">Location</label><input className="form-input" value={newPoll.location} onChange={(e) => setNewPoll({ ...newPoll, location: e.target.value })} required /></div>
                <div><label className="form-label">Closes On</label><input type="date" className="form-input" value={newPoll.closesOn} onChange={(e) => setNewPoll({ ...newPoll, closesOn: e.target.value })} /></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">{newPoll.id ? "Update Poll" : "Create Poll"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPollsSection;
