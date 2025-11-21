import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Flag, X, MapPin, Filter, Check, AlertCircle } from "../../assets/icons"; 
import { ToastContainer, toast } from 'react-toastify'; 
import "../../styles/Petitions.css";

const API_URL = "http://localhost:8080";

const PetitionsSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPetitionId, setSelectedPetitionId] = useState(null);
  const [reportReason, setReportReason] = useState("Spam");
  
  // ✅ STATE: Initialize empty, wait for Backend
  const [petitions, setPetitions] = useState([]);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    location: 'all'
  });

  const [newPetition, setNewPetition] = useState({
    title: "",
    description: "",
    category: "",
    manualLocation: "",
    browserLocation: { latitude: null, longitude: null },
  });

  const loggedInUserId = localStorage.getItem("id") || (user && (user.uid || user._id));

  // ✅ Fetch Petitions from Backend
  const fetchPetitions = async () => {
    try {
      setError(null);
      const res = await axios.get(`${API_URL}/petition/all`);
      if (res.data.success) {
        setPetitions(res.data.data);
      } else {
        setError("Failed to load petitions.");
      }
    } catch (err) {
      console.error("Backend Error:", err);
      setError("Could not connect to the server. Please ensure the backend is running.");
    }
  };

  useEffect(() => {
    fetchPetitions();
  }, []);

  // ✅ Extract Unique Locations
  const allLocations = useMemo(() => {
    const locs = petitions.map(p => p.manualLocation).filter(Boolean);
    return [...new Set(locs)];
  }, [petitions]);

  // ✅ Handle Filter Changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Detect Browser Location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await response.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          setNewPetition(prev => ({ ...prev, manualLocation: address, browserLocation: { latitude, longitude } }));
        } catch (error) {
          setNewPetition(prev => ({ ...prev, manualLocation: `${latitude}, ${longitude}`, browserLocation: { latitude, longitude } }));
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to fetch location.");
      }
    );
  };

  // ✅ Create Petition (Backend Only)
  const handleCreatePetition = async (e) => {
    e.preventDefault();
    if (!newPetition.title || !newPetition.description) {
      alert("Please fill all fields");
      return;
    }

    try {
        const res = await axios.post(`${API_URL}/petition/create`, {
          title: newPetition.title,
          description: newPetition.description,
          category: newPetition.category,
          createdBy: loggedInUserId || "guest",
          manualLocation: newPetition.manualLocation,
          browserLocation: newPetition.browserLocation,
        });

        if (res.data.success) {
          alert("Petition created successfully! It is now Under Review.");
          setShowModal(false);
          setNewPetition({ title: "", description: "", category: "", manualLocation: "", browserLocation: { latitude: null, longitude: null } });
          fetchPetitions(); // Refresh list
        } else {
          alert(res.data.message);
        }
    } catch (err) {
      console.error("Error creating petition:", err);
      alert("Failed to create petition.");
    }
  };

  // ✅ Sign Petition (Backend Only)
  const handleSignPetition = async (id) => {
    try {
      const res = await axios.post(`${API_URL}/petition/${id}/sign`, {
        userId: loggedInUserId || "guest",
        name: user?.name || "Anonymous",
      });
      if (res.data.success) {
        alert("Petition signed successfully!");
        fetchPetitions(); // Refresh list
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Error signing petition:", err);
      alert("Failed to sign petition.");
    }
  };

  // ✅ Open Report Modal
  const openReportModal = (id) => {
    setSelectedPetitionId(id);
    setReportReason("Spam");
    setShowReportModal(true);
  };

  // ✅ Submit Report (Backend Only)
  const handleSubmitReport = async () => {
    if (!selectedPetitionId) return;

    try {
        const res = await axios.post(`${API_URL}/petition/${selectedPetitionId}/report`, {
            userId: loggedInUserId || "guest",
            reason: reportReason
        });
        
        if (res.data.success || res.status === 200) {
            alert("Report submitted successfully.");
            setShowReportModal(false);
            fetchPetitions(); // Refresh list
        } else {
            alert("Failed to report petition.");
        }
    } catch (err) {
        console.error("Error reporting petition:", err);
        alert("Failed to submit report. Backend might be unreachable.");
    }
  };

  // ✅ Filter Logic
  const filteredPetitions = petitions.filter((p) => {
    // 1. Tab Logic
    let tabMatch = true;
    if (activeTab === "all") {
        // Show all relevant petitions (Active, Closed, etc.)
        tabMatch = true; 
    } else if (activeTab === "mine") {
        tabMatch = p.createdBy === loggedInUserId;
    } else if (activeTab === "signed") {
        const sigs = Array.isArray(p.signatures) ? p.signatures : [];
        tabMatch = sigs.some((s) => s.userId === loggedInUserId);
    }

    // 2. Dropdown Filter Logic
    const statusMatch = filters.status === 'all' || 
                        (filters.status === 'active' && (p.status === 'active' || p.status === 'approved')) ||
                        (filters.status === 'review' && (p.status === 'review' || p.status === 'pending')) ||
                        (filters.status === 'closed' && p.status === 'closed');

    const categoryMatch = filters.category === 'all' || p.category === filters.category;
    const locationMatch = filters.location === 'all' || p.manualLocation === filters.location;

    return tabMatch && statusMatch && categoryMatch && locationMatch;
  });

  return (
    <div className="petition-section dashboard-section-placeholder" style={{ width: "100%" }}>
      <div className="petition-container">
        <div className="petition-header" style={{ color: "#21003f" }}>
          <h2>Citizen Petitions</h2>
          <button className="create-btn" onClick={() => setShowModal(true)}>
            + Create Petition
          </button>
        </div>

        {/* Error Banner */}
        {error && (
            <div className="error-state">
                <AlertCircle size={24} style={{margin:'0 auto 0.5rem', display:'block'}}/>
                <strong>Connection Error</strong>
                <p>{error}</p>
                <button className="btn btn-secondary" onClick={fetchPetitions} style={{marginTop:'0.5rem'}}>Retry Connection</button>
            </div>
        )}

        {/* ✅ Filters Section */}
        <div className="petition-filter-bar">
            <div className="filter-group">
                <label>Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="review">Under Review</option>
                    <option value="closed">Closed</option>
                </select>
            </div>
            <div className="filter-group">
                <label>Category</label>
                <select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="all">All Categories</option>
                    <option value="Environment">Environment</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Community">Community</option>
                </select>
            </div>
            <div className="filter-group">
                <label>Location</label>
                <select name="location" value={filters.location} onChange={handleFilterChange}>
                    <option value="all">All Locations</option>
                    {allLocations.map((loc, idx) => (
                        <option key={idx} value={loc}>{loc}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Tabs */}
        <div className="petition-tabs">
          {["all", "mine", "signed"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "All Petitions" : tab === "mine" ? "My Petitions" : "Signed Petitions"}
            </button>
          ))}
        </div>

        {/* Petition List */}
        <div className="petition-list">
          {filteredPetitions.length > 0 ? (
            filteredPetitions.map((p) => {
              const sigs = Array.isArray(p.signatures) ? p.signatures : [];
              const alreadySigned = sigs.some((s) => s.userId === loggedInUserId);

              return (
                <div key={p._id || p.id} className="petition-card">
                  <h3>{p.title}</h3>
                  <p style={{position:"absolute", top:"10px", right:"10px", padding:"3px 7px", borderRadius:"7px", backgroundColor:"#ebebebff", fontSize:"11px",fontWeight:"normal"}}>
                    <strong style={{ 
                        color: (p.status === "active" || p.status === "approved") ? "green" : 
                               (p.status === "closed") ? "gray" : "orange" 
                    }}>
                      {p.status === 'review' || p.status === 'pending' ? 'Under Review' : 
                       p.status === 'approved' ? 'Active' : p.status}
                    </strong>
                  </p>

                  <p>{p.description}</p>
                  <span className="petition-category">{p.category}</span>
                  <p className="petition-location">📍 {p.manualLocation || "Global"}</p>
                  <div className="petition-meta">
                    <p className="signature-count">✍️ {sigs.length} Signatures</p>
                  </div>

                  <div className="petition-actions">
                    {p.status === 'closed' ? (
                      <button className="btn btn-secondary" disabled>🔒 Closed</button>
                    ) : (
                      (p.status === 'active' || p.status === 'approved') ? (
                        <>
                            <button
                            className="sign-btn"
                            disabled={alreadySigned}
                            onClick={() => handleSignPetition(p._id || p.id)}
                            style={{
                                backgroundColor: alreadySigned ? "#4CAF50" : "#007bff",
                                cursor: alreadySigned ? "not-allowed" : "pointer",
                            }}
                            >
                            {alreadySigned ? "Signed ✅" : "Sign"}
                            </button>
                            
                            <button 
                                className="report-btn" 
                                title="Report this petition"
                                onClick={() => openReportModal(p._id || p.id)}
                            >
                                <AlertCircle size={18} />
                            </button>
                        </>
                      ) : (
                          <button className="btn btn-secondary" disabled style={{width:'100%', fontSize:'0.8rem'}}>
                            Waiting for Approval
                          </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results-placeholder" style={{gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'#94a3b8', border:'1px dashed #cbd5e1', borderRadius:'0.5rem'}}>
                <p>No petitions found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Create Petition Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
                <h2>Create New Petition</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleCreatePetition}>
              <input type="text" placeholder="Petition Title" value={newPetition.title} onChange={(e) => setNewPetition({ ...newPetition, title: e.target.value })} required />
              <textarea placeholder="Describe your petition..." value={newPetition.description} onChange={(e) => setNewPetition({ ...newPetition, description: e.target.value })} required></textarea>
              <select value={newPetition.category} onChange={(e) => setNewPetition({ ...newPetition, category: e.target.value })} className="petition-select" required>
                <option value="">-- Select Category --</option>
                <option value="Environment">Environment</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Community">Community</option>
              </select>
              <input type="text" placeholder="Enter your location" value={newPetition.manualLocation} onChange={(e) => setNewPetition({ ...newPetition, manualLocation: e.target.value })} />
              <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Create Petition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Report Petition Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:'400px'}}>
            <div className="modal-header">
                <h2>Report Petition</h2>
                <button className="modal-close" onClick={() => setShowReportModal(false)}><X size={24}/></button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                <p style={{color:'#64748b', fontSize:'0.9rem'}}>Please select a reason for reporting this petition.</p>
                <select 
                    value={reportReason} 
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{padding:'0.5rem', border:'1px solid #cbd5e1', borderRadius:'0.375rem'}}
                >
                    <option value="Spam">Spam or Misleading</option>
                    <option value="Harassment">Harassment or Hate Speech</option>
                    <option value="False Information">False Information</option>
                    <option value="Inappropriate">Inappropriate Content</option>
                    <option value="Other">Other</option>
                </select>
                <div className="modal-buttons">
                    <button type="button" className="cancel-btn" onClick={() => setShowReportModal(false)}>Cancel</button>
                    <button type="button" className="submit-btn" style={{background:'#dc2626'}} onClick={handleSubmitReport}>Submit Report</button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container logic */}
    </div>
  );
};

export default PetitionsSection;