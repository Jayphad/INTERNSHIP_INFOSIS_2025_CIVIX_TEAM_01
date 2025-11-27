// src/components/polls/PollsSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart2,
  Plus,
  AlertCircle,
  Trash2,
  CheckSquare,
  MapPin,
  Check,
  Clock,
  X,
  Edit2,
  MessageSquare, // Feedback Icon
  Filter,
  ChevronDown,
  HelpCircle,
  Calendar
} from '../../assets/icons';
import "../../styles/Polls.css";

// NOTE: change if backend runs on other port
const API_URL = "http://localhost:8080/polls";

const timeAgo = (dateString) => {
  if (!dateString) return "Just now";
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getUserId = (user) => {
  const storedId = localStorage.getItem("id");
  if (storedId) return storedId;
  if (user) return user.uid || user.userId || user._id || user.id;
  return null;
};

const PollsSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [newPoll, setNewPoll] = useState({ id: null, question: "", description: "", options: [{ text: "" }, { text: "" }], location: "", closesOn: "" });
  const [feedbackData, setFeedbackData] = useState({ pollId: null, type: "Suggestion", details: "" });
  const loggedInUserId = getUserId(user);
  const userName = user?.name || "User";

  // Load cache fallback first (optional)
  useEffect(() => {
    const cached = localStorage.getItem('civix_polls_cache');
    if (cached) {
      try { setPolls(JSON.parse(cached)); } catch {}
    }
    fetchPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save cache on polls change (helps dev & offline)
  useEffect(() => {
    localStorage.setItem('civix_polls_cache', JSON.stringify(polls));
  }, [polls]);

  const allLocations = useMemo(() => {
    return [...new Set(polls.map(p => p.location).filter(Boolean))];
  }, [polls]);

  // ------------------------
  // Backend integration
  // ------------------------
  // after fetching polls, normalize _id to id
const fetchPolls = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${API_URL}/all`);
    if (res?.data?.success) {
      // normalize id
      const data = res.data.data.map(p => ({ ...p, id: p._id }));
      setPolls(data);
    } else {
      console.warn("Failed to fetch polls from backend");
    }
  } catch (err) {
    console.error("Error fetching polls:", err);
  } finally {
    setLoading(false);
  }
};

const handleCreateOrUpdate = async (e) => {
  e.preventDefault();

  const cleanOptions = newPoll.options.filter(o => o.text?.trim() !== "");
  if (cleanOptions.length < 2) {
    alert("Please provide at least 2 options.");
    return;
  }

  const payload = {
    question: newPoll.question,
    description: newPoll.description,
    location: newPoll.location,
    closesOn: newPoll.closesOn,
    options: cleanOptions.map((o, i) => ({
      id: o.id || `opt_${Date.now()}_${i}`,
      text: o.text
    })),
    authorId: loggedInUserId,
    authorName: userName,
  };

  try {
    let res;

    if (newPoll.id) {
      // 🔥 UPDATE EXISTING POLL
      res = await axios.put(`${API_URL}/${newPoll.id}/update`, payload);
      alert("Poll updated successfully!");
    } else {
      // 🆕 CREATE NEW POLL
      res = await axios.post(`${API_URL}/create`, payload);
      alert("Poll created successfully!");
    }

    if (res.data.success) {
      const updated = { ...res.data.data, id: res.data.data._id };

      setPolls(prev => {
        if (newPoll.id) {
          // Replace old poll
          return prev.map(p => p.id === newPoll.id ? updated : p);
        } else {
          // Add new poll
          return [updated, ...prev];
        }
      });

      setShowCreateModal(false);
      setNewPoll({
        id: null,
        question: "",
        description: "",
        options: [{ text: "" }, { text: "" }],
        location: "",
        closesOn: ""
      });
    }
  } catch (err) {
    console.error(err);
    alert("Error saving poll. Check console.");
  }
};



  const handleDelete = async (id) => {
    if (!window.confirm("Delete this poll permanently?")) return;
    try {
      const res = await axios.post(`${API_URL}/${id}/delete`, { userId: loggedInUserId });
      if (res?.data?.success) {
        setPolls(prev => prev.filter(p => p.id !== id));
      } else {
        throw new Error(res?.data?.message || "Delete failed");
      }
    } catch (err) {
      console.error("Error deleting poll:", err);
      alert("Failed to delete poll.");
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (!loggedInUserId) {
      alert("Please log in to vote.");
      return;
    }

    // optimistic update
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      const existing = (p.results && p.results[optionId]) || 0;
      return {
        ...p,
        results: { ...(p.results || {}), [optionId]: existing + 1 },
        totalVotes: (p.totalVotes || 0) + 1,
        votedBy: [...(p.votedBy || []), loggedInUserId],
        userVote: { ...(p.userVote || {}), [loggedInUserId]: optionId }
      };
    }));

    try {
      const res = await axios.post(`${API_URL}/${pollId}/vote`, { userId: loggedInUserId, optionId });
      if (!res?.data?.success) {
        // rollback: refetch from server
        console.warn("Vote failed on server, refetching polls");
        await fetchPolls();
        alert(res?.data?.message || "Failed to register vote.");
      } else {
        // if server returns updated poll, merge it (preferred)
        if (res.data.data) {
          setPolls(prev => prev.map(p => p.id === pollId ? res.data.data : p));
        }
      }
    } catch (err) {
      console.error("Error during vote:", err);
      alert("Failed to submit vote. Try again.");
      await fetchPolls();
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackData.pollId) return;
    try {
      const res = await axios.post(`${API_URL}/${feedbackData.pollId}/feedback`, {
        userId: loggedInUserId,
        type: feedbackData.type,
        details: feedbackData.details
      });
      if (res?.data?.success) {
        // update local polls (if returned)
        if (res.data.data) {
          setPolls(prev => prev.map(
            p => p.id === (res.data.data._id || res.data.data.id)
                ? { ...res.data.data, id: res.data.data._id } 
                : p
            ));

        } else {
          // non-server fallback: push to local
          setPolls(prev => prev.map(p => {
            if (p.id !== feedbackData.pollId) return p;
            const fb = p.feedback ? [...p.feedback, { userId: loggedInUserId, type: feedbackData.type, details: feedbackData.details, date: new Date().toISOString() }] : [{ userId: loggedInUserId, type: feedbackData.type, details: feedbackData.details, date: new Date().toISOString() }];
            return { ...p, feedback: fb };
          }));
        }
        alert("Feedback submitted!");
      } else throw new Error(res?.data?.message || "Feedback failed");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback.");
    } finally {
      setShowFeedbackModal(false);
      setFeedbackData({ pollId: null, type: "Suggestion", details: "" });
    }
  };

  const openEditModal = (p) => {
    setNewPoll({
      id: p.id,
      question: p.question,
      description: p.description,
      options: p.options.map(o => ({ ...o })), // copy
      location: p.location,
      closesOn: p.closesOn
    });
    setShowCreateModal(true);
  };

  const handleClosePoll = async (id) => {
    if (!window.confirm("Close this poll? No more votes will be accepted.")) return;
    try {
      const res = await axios.post(`${API_URL}/${id}/close`, { userId: loggedInUserId });
      if (res?.data?.success) {
        setPolls(prev => prev.map(p => p.id === id ? res.data.data : p));
      } else throw new Error(res?.data?.message || 'Close failed');
    } catch (err) {
      console.error("Failed to close poll:", err);
      alert("Failed to close poll.");
    }
  };

  // ------------------------
  // Filtering & rendering helpers
  // ------------------------
  const filteredPolls = useMemo(() => {
    let filtered = polls || [];
    if (activeTab === 'active') filtered = filtered.filter(p => p.status === 'active');
    if (activeTab === 'voted') filtered = filtered.filter(p => (p.votedBy || []).includes(loggedInUserId));
    if (activeTab === 'mine') filtered = filtered.filter(p => p.authorId === loggedInUserId);
    if (activeTab === 'closed') filtered = filtered.filter(p => p.status === 'closed');

    if (locationFilter !== 'All Locations') {
      filtered = filtered.filter(p => p.location === locationFilter);
    }
    return filtered;
  }, [polls, activeTab, locationFilter, loggedInUserId]);

  // ------------------------
  // UI
  // ------------------------
  return (
    <div className="polls-section">
      <div className="polls-container">
        <div className="polls-header">
          <div>
            <h1 className="page-title">Community Polls</h1>
            <p className="page-subtitle">Participate in community polls and make your voice heard.</p>
          </div>
          <button
            className="create-btn"
            onClick={() => {
              setNewPoll({ id: null, question: "", description: "", options: [{ text: "" }, { text: "" }], location: "", closesOn: "" });
              setShowCreateModal(true);
            }}
          >
            <Plus size={20} /> Create Poll
          </button>
        </div>

        <div className="polls-toolbar">
          <div className="poll-tabs">
            <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Active Polls</button>
            <button className={`tab-btn ${activeTab === 'voted' ? 'active' : ''}`} onClick={() => setActiveTab('voted')}>Polls I Voted On</button>
            <button className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>My Polls</button>
            <button className={`tab-btn ${activeTab === 'closed' ? 'active' : ''}`} onClick={() => setActiveTab('closed')}>Closed Polls</button>
          </div>
          <div className="location-filter">
            <MapPin size={16} className="loc-icon" />
            {/* <ChevronDown size={16} className="chevron-icon" /> */}
            <select className="location-select" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option>All Locations</option>
              {allLocations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="poll-list">
          {loading ? (
            <div style={{ padding: 20 }}>Loading polls…</div>
          ) : filteredPolls.length === 0 ? (
            <div className="no-results">
              <p>No polls found. (Try clearing filters or check 'My Polls')</p>
              <button className="tab-btn active" style={{ marginTop: '1rem' }} onClick={() => { setLocationFilter('All Locations'); setActiveTab('active'); }}>Clear Filters</button>
            </div>
          ) : (
            filteredPolls.map(poll => {
              const hasVoted = (poll.votedBy || []).includes(loggedInUserId);
              const isOwner = poll.authorId === loggedInUserId;
              const isClosed = poll.status === 'closed';
              const isReview = poll.status === 'review';
              const userVoteId = (poll.userVote || {})[loggedInUserId];
              const isActive = poll.status === 'active';
              const statusClass = isActive ? 'status-active' : isReview ? 'status-review' : 'status-closed';
              const statusText = isActive ? 'Active' : isReview ? 'Under Review' : 'Closed';

              return (
                <div key={poll.id} className="poll-card">
                  <div className="card-top-row">
                    <div className="time-badge"><Clock size={12} /> Created {timeAgo(poll.createdAt)}</div>
                  </div>
                  <h3 className="card-title">{poll.question}</h3>
                  <div className="card-meta">
                    <span>By: {poll.authorName || "Anonymous"}</span><span style={{ color: '#cbd5e1' }}>|</span><span><MapPin size={14} /> {poll.location || "Global"}</span>
                  </div>
                  <p style={{ color: '#475569', lineHeight: 1.5 }}>{poll.description}</p>

                  <div className="status-row">
                    <span className="vote-count">{poll.totalVotes || 0} Votes</span>
                    <span className={`status-badge ${statusClass}`}>{statusText}</span>
                  </div>

                  {isReview ? (
                    <div style={{ padding: '1rem', background: '#fffbeb', color: '#92400e', borderRadius: '.5rem', fontSize: '.9rem', border: '1px solid #fcd34d' }}>
                      Under Review by Admins
                    </div>
                  ) : (hasVoted || isClosed) ? (
                    <div>
                      {poll.options.map(opt => {
                        const count = (poll.results || {})[opt.id] || 0;
                        const total = poll.totalVotes || 1;
                        const pct = Math.round((count / total) * 100);
                        const isUserChoice = userVoteId === opt.id;
                        return (
                          <div key={opt.id} className="result-bar-container">
                            <div className="result-label"><span>{opt.text}</span><span>{pct}%</span></div>
                            <div className="result-track"><div className="result-fill" style={{ width: `${pct}%` }}></div></div>
                            {isUserChoice && <div style={{ fontSize: '.75rem', color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Your Vote</div>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="poll-options-grid">
                      {poll.options.map(opt => (
                        <button key={opt.id} className="poll-option-btn" onClick={() => handleVote(poll.id, opt.id)}>{opt.text}</button>
                      ))}
                    </div>
                  )}

                  <div className="poll-footer">
                    <div>Closes: {poll.closesOn || "N/A"}</div>
                    <div className="action-group">
                      <button
                        className="icon-btn feedback"
                        title={isClosed ? "Feedback Disabled (Closed)" : "Give Feedback"}
                        disabled={isClosed}
                        onClick={() => {
                          if (isClosed) return;
                          setFeedbackData({ pollId: poll.id, type: "Suggestion", details: "" });
                          setShowFeedbackModal(true);
                        }}
                      >
                        <MessageSquare size={18} />
                      </button>

                      {isOwner && (
                        <>
                          <button
                            className="icon-btn"
                            title={isClosed ? "Cannot edit closed poll" : "Edit"}
                            disabled={isClosed}
                            onClick={() => !isClosed && openEditModal(poll)}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button className="icon-btn delete" title="Delete" onClick={() => handleDelete(poll.id)}><Trash2 size={18} /></button>

                          {/* Owner: close poll */}
                          {!isClosed && <button className="icon-btn" title="Close poll" onClick={() => handleClosePoll(poll.id)}><CheckSquare size={18} /></button>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="promo-card">
          <h3 className="promo-title">Have a question for your community?</h3>
          <p className="promo-text">Create a poll to gather input and understand public sentiment on local issues.</p>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div><h3 className="modal-title">{newPoll.id ? "Edit Poll" : "Create a New Poll"}</h3></div>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="form-section"><label className="form-label">Poll Question</label><input className="form-input" value={newPoll.question} onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })} required /></div>
              <div className="form-section"><label className="form-label">Description</label><textarea className="form-textarea" rows="3" value={newPoll.description} onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })} /></div>
              <div className="form-section"><label className="form-label">Poll Options</label>
                <div style={{ display: 'grid', gap: '.5rem' }}>
                  {newPoll.options.map((opt, idx) => (
                    <div key={idx} className="option-row">
                      <input className="form-input" value={opt.text} onChange={(e) => {
                        const newOpts = [...newPoll.options]; newOpts[idx].text = e.target.value; setNewPoll({ ...newPoll, options: newOpts });
                      }} />
                    </div>
                  ))}
                </div>
                {newPoll.options.length < 10 && <button type="button" className="add-opt-btn" onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, { text: "" }] })}><Plus size={16} /> Add Option</button>}
              </div>
              <div className="form-row">
                <div><label className="form-label">Location</label><input className="form-input" value={newPoll.location} onChange={(e) => setNewPoll({ ...newPoll, location: e.target.value })} required /></div>
                <div><label className="form-label">Closes On</label><input type="date" className="form-input" value={newPoll.closesOn} onChange={(e) => setNewPoll({ ...newPoll, closesOn: e.target.value })} required /></div>
              </div>
              <div className="info-box"><AlertCircle size={20} className="info-icon" /><div className="info-content"><h4>Important</h4><p>Polls should be genuine community questions.</p></div></div>
              <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button><button type="submit" className="btn-submit">{newPoll.id ? "Update Poll" : "Create Poll"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '500px' }}>
            <div className="modal-header"><h3>Provide Feedback</h3><button className="modal-close-btn" onClick={() => setShowFeedbackModal(false)}><X size={24} /></button></div>
            <form onSubmit={handleSubmitFeedback}>
              <div className="form-section"><label className="form-label">Feedback Type</label>
                <select className="form-input" value={feedbackData.type} onChange={(e) => setFeedbackData({ ...feedbackData, type: e.target.value })}>
                  <option>Suggestion</option><option>Issue Report</option><option>Other</option>
                </select>
              </div>
              <div className="form-section"><label className="form-label">Details</label>
                <textarea className="form-textarea" rows="4" value={feedbackData.details} onChange={(e) => setFeedbackData({ ...feedbackData, details: e.target.value })} required></textarea>
              </div>
              <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setShowFeedbackModal(false)}>Cancel</button><button type="submit" className="btn-submit">Send Feedback</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PollsSection;
