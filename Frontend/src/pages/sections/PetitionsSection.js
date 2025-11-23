import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
    X, MapPin, Filter, Check, AlertCircle, Plus, 
  Search, Calendar, Edit2, Trash2, ChevronDown 
} from "../../assets/icons"; 
import { ToastContainer, toast } from 'react-toastify'; 
import "../../styles/Petitions.css";

const API_URL = "http://localhost:8080";

// --- Helper: Time Ago ---
const timeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Less than a minute ago";
};

const PetitionsSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [petitions, setPetitions] = useState([]);
  const [error, setError] = useState(null);

  // --- Report State ---
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPetitionId, setSelectedPetitionId] = useState(null);
  const [reportReason, setReportReason] = useState("Spam");

  // --- Filters ---
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    location: 'all'
  });

  // --- Form State ---
  const [newPetition, setNewPetition] = useState({
    id: null, // For editing
    title: "",
    description: "",
    category: "Community",
    location: "", 
    goal: 100
  });

  const loggedInUserId = localStorage.getItem("id") || (user && (user.uid || user._id));

  // ✅ Fetch Petitions
  const fetchPetitions = async () => {
    try {
      setError(null);
      const res = await axios.get(`${API_URL}/petition/all`);
      if (res.data.success) {
        // Process data
        const formatted = res.data.data.map(p => ({
            ...p,
            signatures: Array.isArray(p.signatures) ? p.signatures : [],
            goal: p.signatureGoal || 100,
            status: p.status || 'review'
        }));
        setPetitions(formatted);
      }
    } catch (err) {
      console.error("Error fetching petitions:", err);
      setError("Could not connect to server.");
    }
  };

  useEffect(() => {
    fetchPetitions();
  }, []);

  const allLocations = useMemo(() => {
    const locs = petitions.map(p => p.manualLocation).filter(Boolean);
    return [...new Set(locs)];
  }, [petitions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Create or Update Petition
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const isEdit = !!newPetition.id;
    const endpoint = isEdit ? `${API_URL}/petition/${newPetition.id}/update` : `${API_URL}/petition/create`;
    
    try {
        const payload = {
            title: newPetition.title,
            description: newPetition.description,
            category: newPetition.category,
            manualLocation: newPetition.location,
            signatureGoal: newPetition.goal,
            userId: loggedInUserId,
            // For create only:
            createdBy: loggedInUserId,
            author: user?.name || "User",
            status: "review"
        };

        const res = isEdit 
            ? await axios.put(endpoint, payload)
            : await axios.post(endpoint, payload);

        if (res.data.success) {
            alert(isEdit ? "Petition Updated!" : "Petition Created! Under Review.");
            setShowModal(false);
            setNewPetition({ id: null, title: "", description: "", category: "Community", location: "", goal: 100 });
            fetchPetitions();
        } else {
            alert(res.data.message);
        }
    } catch (err) {
        console.error("Error submitting:", err);
        alert("Failed to submit petition.");
    }
  };

  // ✅ Delete Own Petition
  const handleDelete = async (id) => {
      if(!window.confirm("Delete this petition? This cannot be undone.")) return;
      try {
          const res = await axios.post(`${API_URL}/petition/${id}/delete`, { userId: loggedInUserId });
          if(res.data.success) {
              alert("Petition deleted.");
              fetchPetitions();
          }
      } catch(err) {
          alert("Failed to delete petition.");
      }
  };

  // ✅ Edit Helper
  const openEditModal = (p) => {
      setNewPetition({
          id: p._id || p.id,
          title: p.title,
          description: p.description,
          category: p.category,
          location: p.manualLocation,
          goal: p.goal || 100
      });
      setShowModal(true);
  };

  // ✅ Sign Petition
  const handleSign = async (id) => {
      try {
          const res = await axios.post(`${API_URL}/petition/${id}/sign`, { userId: loggedInUserId, name: user?.name || "User" });
          if(res.data.success) fetchPetitions();
      } catch(e) { alert("Failed to sign."); }
  };

  // ✅ NEW: Unsign Petition (Remove Signature)
  const handleUnsign = async (id) => {
      if(!window.confirm("Are you sure you want to remove your signature?")) return;
      try {
          const res = await axios.post(`${API_URL}/petition/${id}/unsign`, { userId: loggedInUserId });
          if(res.data.success) {
              alert("Signature removed successfully.");
              fetchPetitions();
          } else {
              alert(res.data.message || "Failed to unsign.");
          }
      } catch(e) { 
          // Fallback if backend doesn't support unsign yet
          alert("Failed to remove signature. Backend endpoint might be missing."); 
      }
  };

  // ✅ Report Logic
  const openReportModal = (id) => {
    setSelectedPetitionId(id);
    setReportReason("Spam");
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedPetitionId) return;
    try {
        const res = await axios.post(`${API_URL}/petition/${selectedPetitionId}/report`, {
            userId: loggedInUserId,
            reason: reportReason
        });
        if (res.data.success || res.status === 200) {
            alert("Report submitted successfully.");
            setShowReportModal(false);
            fetchPetitions(); 
        } else {
            alert("Failed to report petition.");
        }
    } catch (err) {
        alert("Failed to submit report.");
    }
  };

  // ✅ Filter Logic
  const filteredPetitions = petitions.filter((p) => {
    // 1. Tabs
    let tabMatch = true;
    if (activeTab === "mine") tabMatch = p.createdBy === loggedInUserId;
    else if (activeTab === "signed") tabMatch = p.signatures.some(s => s.userId === loggedInUserId);
    
    // 2. Dropdowns
    const statusMatch = filters.status === 'all' || 
        (filters.status === 'active' && (p.status === 'active' || p.status === 'approved')) ||
        (filters.status === 'review' && (p.status === 'review' || p.status === 'pending')) ||
        (filters.status === 'closed' && p.status === 'closed');

    const catMatch = filters.category === 'all' || p.category === filters.category;
    const locMatch = filters.location === 'all' || p.manualLocation === filters.location;

    return tabMatch && statusMatch && catMatch && locMatch;
  });

  return (
    <div className="petition-section">
      <div className="petition-container">
        
        <div className="petition-header">
            <div>
                <h2 className="page-title">Citizen Petitions</h2>
                <p className="page-subtitle">Browse, sign, and track petitions in your community.</p>
            </div>

            <button className="create-btn" onClick={() => {
                setNewPetition({ id: null, title: "", description: "", category: "Community", location: "", goal: 100 });
                setShowModal(true);
              }}>
                <Plus size={18}/> Create Petition
            </button>
        </div>

        {/* ✅ Toolbar: Tabs + Filters */}
        <div className="petition-toolbar">
            <div className="petition-tabs">
                <button className={`petition-tab-btn ${activeTab==='all'?'active':''}`} onClick={()=>setActiveTab('all')}>All Petitions</button>
                <button className={`petition-tab-btn ${activeTab==='mine'?'active':''}`} onClick={()=>setActiveTab('mine')}>My Petitions</button>
                <button className={`petition-tab-btn ${activeTab==='signed'?'active':''}`} onClick={()=>setActiveTab('signed')}>Signed by Me</button>
            </div>

            <div className="filter-actions">
                {/* Location Filter */}
                <div className="filter-dropdown-container">
                    <button className="filter-btn"><MapPin size={16}/> {filters.location === 'all' ? 'All Locations' : filters.location} <ChevronDown size={14}/></button>
                    <select name="location" value={filters.location} onChange={handleFilterChange} className="filter-select">
                        <option value="all">All Locations</option>
                        {allLocations.map(l=><option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                {/* Category Filter */}
                <div className="filter-dropdown-container">
                    <button className="filter-btn"><Filter size={16}/> {filters.category === 'all' ? 'All Categories' : filters.category} <ChevronDown size={14}/></button>
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="filter-select">
                        <option value="all">All Categories</option>
                        <option value="Environment">Environment</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Community">Community</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div className="filter-dropdown-container">
                    <button className="filter-btn">Status: {filters.status === 'all' ? 'All' : filters.status} <ChevronDown size={14}/></button>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="review">Under Review</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

            </div>
        </div>

        {/* ✅ Cards Grid */}
        <div className="petition-list">
            {filteredPetitions.map(p => {
                const sigCount = p.signatures.length;
                const goal = p.goal || 100;
                const progress = Math.min((sigCount / goal) * 100, 100);
                const isOwner = p.createdBy === loggedInUserId;
                const isSigned = p.signatures.some(s => s.userId === loggedInUserId);
                const isActive = p.status === 'active' || p.status === 'approved';

                return (
                    <div key={p._id || p.id} className="petition-card">
                        <div className="card-header-row">
                            <span className="category-badge">{p.category}</span>
                            <span className="time-ago">{timeAgo(p.createdAt)}</span>
                        </div>

                        <h3 className="card-title">{p.title}</h3>
                        
                        {/* Meta Row with Author and Location */}
                        <div className="card-meta-row">
                            <span className="meta-item">By {p.author || "Anonymous"}</span>
                            <span className="meta-item"><MapPin size={14}/> {p.manualLocation || "Global"}</span>
                        </div>

                        <p className="card-desc">{p.description}</p>

                        <div className="progress-section">
                            <div className="progress-info">
                                <span>{sigCount} of {goal} signatures</span>
                                <span className="progress-status" style={{color: p.status === 'pending' || p.status === 'review' ? '#fbbf24' : (isActive ? '#16a34a' : '#64748b')}}>
                                    {p.status === 'pending' || p.status === 'review' ? 'Under Review' : (isActive ? 'Active' : 'Closed')}
                                </span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{width: `${progress}%`}}></div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button className="view-details-btn">View Details</button>
                            
                            <div className="action-btn-group">
                                {/* Edit/Delete for Owner */}
                                {isOwner && (
                                    <>
                                        <button className="icon-action-btn" title="Edit" onClick={() => openEditModal(p)}><Edit2 size={16}/></button>
                                        <button className="icon-action-btn delete" title="Delete" onClick={() => handleDelete(p._id || p.id)}><Trash2 size={16}/></button>
                                    </>
                                )}

                                {/* Report Button Restored */}
                                <button className="icon-action-btn report" title="Report" onClick={() => openReportModal(p._id || p.id)}>
                                    <AlertCircle size={16} />
                                </button>

                                {/* Sign/Unsign Button */}
                                {isActive && (
                                    <button 
                                        className={`sign-btn ${isSigned ? 'signed' : 'active'}`} 
                                        onClick={() => isSigned ? handleUnsign(p._id || p.id) : handleSign(p._id || p.id)}
                                        title={isSigned ? "Click to Remove Signature" : "Sign Petition"}
                                    >
                                        {isSigned ? 'Signed (Remove)' : 'Sign Petition'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

      </div>

      {/* ✅ Create/Edit Modal (Matches Admin Design) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
                <h3>{newPetition.id ? 'Edit Petition' : 'Create a New Petition'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="form-group">
                <label>Petition Title</label>
                <input required value={newPetition.title} onChange={(e) => setNewPetition({...newPetition, title: e.target.value})} placeholder="Give your petition a clear, specific title" />
                <span className="form-helper">Choose a title that clearly states what change you want to see.</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                    <label>Category</label>
                    <select value={newPetition.category} onChange={(e) => setNewPetition({...newPetition, category: e.target.value})}>
                        <option>Community</option>
                        <option>Infrastructure</option>
                        <option>Education</option>
                        <option>Healthcare</option>
                        <option>Environment</option>
                        <option>Public Safety</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input placeholder="Select a Location" value={newPetition.location} onChange={(e) => setNewPetition({...newPetition, location: e.target.value})} />
                    <span className="form-helper">The area this petition concerns.</span>
                </div>
              </div>

              <div className="form-group">
                <label>Signature Goal</label>
                <input type="number" value={newPetition.goal} onChange={(e) => setNewPetition({...newPetition, goal: e.target.value})} />
                <span className="form-helper">How many signatures are you aiming to collect?</span>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea required rows="4" value={newPetition.description} onChange={(e) => setNewPetition({...newPetition, description: e.target.value})} placeholder="Describe the issue and the change you'd like to see..."></textarea>
                <span className="form-helper">Clearly explain the issue, why it matters, and what specific action you're requesting.</span>
              </div>

              <div className="info-alert">
                <AlertCircle size={20} />
                <div>
                    <strong>Important Information</strong>
                    <p style={{margin:0}}>By submitting this petition, you acknowledge that the content is factual to the best of your knowledge and does not contain misleading information. Civix reserves the right to remove petitions that violate our community guidelines.</p>
                </div>
              </div>

              <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{newPetition.id ? 'Update Petition' : 'Publish Petition'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:'400px'}}>
            <div className="modal-header">
                <h3>Report Petition</h3>
                <button className="modal-close" onClick={() => setShowReportModal(false)}><X size={24}/></button>
            </div>
            <div className="form-group">
                <label>Reason for Reporting</label>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                    <option value="Spam">Spam or Misleading</option>
                    <option value="Harassment">Harassment or Hate Speech</option>
                    <option value="False Information">False Information</option>
                    <option value="Inappropriate">Inappropriate Content</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="button" className="submit-btn" style={{background:'#dc2626'}} onClick={handleSubmitReport}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetitionsSection;