import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
    X, MapPin, Filter, Check, AlertCircle, Plus, 
    Search, Calendar, Edit2, Trash2, ChevronDown, Eye 
} from "../../assets/icons"; 
import { ToastContainer, toast } from 'react-toastify'; 
import { handleError, handleSuccess } from '../../utils';
import "../../styles/Petitions.css";

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


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
  const [viewPetition, setViewPetition] = useState(null); // State for View Modal
  const [petitions, setPetitions] = useState([]);
  const [error, setError] = useState(null);

  // --- Report State ---
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPetitionId, setSelectedPetitionId] = useState(null);
  const [reportReason, setReportReason] = useState("Spam");
  // ✅ Added state for custom report reason
  const [customReason, setCustomReason] = useState("");

  // --- Filters ---
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    location: 'all'
  });

  // --- Form State ---
  const [newPetition, setNewPetition] = useState({
  id: null,
  title: "",
  description: "",
  category: "Community",
  manualLocation: "",
  browserLocation: { latitude: null, longitude: null },
  goal: 99,
});


  const loggedInUserId = localStorage.getItem("id") || (user && (user.uid || user._id));

   const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  
  // --- Activity Logger (Stores in LocalStorage) ---
const logActivity = (activity) => {
  const existing = JSON.parse(localStorage.getItem("userActivity") || "[]");
  existing.unshift(activity); // add to top
  localStorage.setItem("userActivity", JSON.stringify(existing.slice(0, 20))); // keep last 20
};


const handleFilterChange = (e) => {
    setFilters({
        ...filters,
        [e.target.name]: e.target.value
    });
};const allLocations = useMemo(() => {
    const locs = petitions
        .map(p => p.manualLocation)
        .filter(l => l && l.trim() !== "");
    return [...new Set(locs)];
}, [petitions]);

const [showMapModal, setShowMapModal] = useState(false);
const [selectedPosition, setSelectedPosition] = useState(
  newPetition.browserLocation?.latitude && newPetition.browserLocation?.longitude
    ? [newPetition.browserLocation.latitude, newPetition.browserLocation.longitude]
    : null
);



//component for location 
const LocationMarker = ({ setNewPetition }) => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);

      // Reverse geocode to get address
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        const address = data.display_name || `${lat}, ${lng}`;

        setNewPetition(prev => ({
          ...prev,
          browserLocation: { latitude: lat, longitude: lng },
          manualLocation: address
        }));
      } catch (err) {
        console.error("Error fetching address:", err);
        setNewPetition(prev => ({
          ...prev,
          browserLocation: { latitude: lat, longitude: lng },
          manualLocation: `${lat}, ${lng}`
        }));
      }
    },

    locationfound(e) {
      setPosition(e.latlng);
    }
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: async (e) => {
          const latlng = e.target.getLatLng();
          setPosition(latlng);

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`);
            const data = await res.json();
            const address = data.display_name || `${latlng.lat}, ${latlng.lng}`;

            setNewPetition(prev => ({
              ...prev,
              browserLocation: { latitude: latlng.lat, longitude: latlng.lng },
              manualLocation: address
            }));
          } catch (err) {
            setNewPetition(prev => ({
              ...prev,
              browserLocation: { latitude: latlng.lat, longitude: latlng.lng },
              manualLocation: `${latlng.lat}, ${latlng.lng}`
            }));
          }
        }
      }}
    />
  );
};






  // ✅ Fetch Petitions
 const fetchPetitions = async () => {
    try {
      const res = await axios.get(`${API_URL}/petition/all`);
      if (res.data.success) setPetitions(res.data.data);
    } catch (err) {
      console.error("Error fetching petitions:", err);
    }
  };

   // ✅ Open Create Petition modal automatically if triggered from Dashboard
  useEffect(() => {
    const fromDashboard = localStorage.getItem("openCreatePetition");
    if (fromDashboard === "true") {
      setShowModal(true);
      localStorage.removeItem("openCreatePetition");
    }
    fetchPetitions();
  }, []);


  // // ✅ Detect browser location
  // const detectLocation = async () => {
  //   if (!navigator.geolocation) {
  //     // alert("❌ Geolocation is not supported by your browser.");
  //     handleError("Geolocation is not supported by your browser");

  //     return;
  //   }

  //   navigator.geolocation.getCurrentPosition(
  //     async (position) => {
  //       const { latitude, longitude } = position.coords;
  //       try {
  //         const response = await fetch(
  //           `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
  //         );
  //         const data = await response.json();
  //         const address = data.display_name || `${latitude}, ${longitude}`;

  //         setNewPetition((prev) => ({
  //           ...prev,
  //           manualLocation: address,
  //           browserLocation: { latitude, longitude },
  //         }));
  //         // alert("✅ Location detected successfully!");
  //         handleSuccess("Location detected successfully");
  //       } catch (error) {
  //         console.error("Error fetching address:", error);
  //         setNewPetition((prev) => ({
  //           ...prev,
  //           manualLocation: `${latitude}, ${longitude}`,
  //           browserLocation: { latitude, longitude },
  //         }));
  //       }
  //     },
  //     (error) => {
  //       console.error("Location error:", error);
  //       // alert("❌ Unable to fetch your location. Please enter manually.");
  //       handleError("Unable to fetch your location. Please enter manually.");
  //     }
  //   );
  // };

 // ✅ Create or Update Petition
const handleCreateOrUpdate = async (e) => {
  e.preventDefault();
  const isEdit = !!newPetition.id;
  const endpoint = isEdit 
    ? `${API_URL}/petition/${newPetition.id}/update` 
    : `${API_URL}/petition/create`;

  const payload = {
    title: newPetition.title,
    description: newPetition.description,
    category: newPetition.category,
    manualLocation: newPetition.manualLocation || "",
    browserLocation: newPetition.browserLocation || null,
    goal: Number(newPetition.goal),
    createdBy: loggedInUserId,
    userId: loggedInUserId,
    author: user?.name || "User",
    status: "review"   // ensure status resets on edit
  };

  try {
    const res = isEdit
      ? await axios.put(endpoint, payload)
      : await axios.post(endpoint, payload);

    if (res.data.success) {
      handleSuccess(isEdit 
        ? "Petition Updated! It is now under review."
        : "Petition Created! Under Review."
      );

      setShowModal(false);

      // Reset form state
      setNewPetition({
        id: null,
        title: "",
        description: "",
        category: "Community",
        manualLocation: "",
        browserLocation: { latitude: null, longitude: null },
        goal: 99
      });

      // ✅ Fetch fresh data from backend to update frontend
      fetchPetitions();

    } else {
      handleError(res.data.message);
    }
  } catch (err) {
    console.error("Error submitting:", err);
    handleError("Failed to submit petition.");
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
        manualLocation: p.manualLocation || "",
        browserLocation: p.browserLocation || { latitude: null, longitude: null },
        goal: p.goal,
    });
      setShowModal(true);
  };
// Sign a petition
const handleSign = async (id) => {
  if (!loggedInUserId) {
    alert("User ID missing. Please re-login.");
    return;
  }
  
  try {
    const res = await axios.post(`${API_URL}/petition/${id}/sign`, {
      userId: loggedInUserId,
      name: user?.name || "User"
    });

     if (res.data.success) {
      fetchPetitions();

      // ✅ Add activity log HERE
      logActivity({
        id: crypto.randomUUID(),
        type: "Petition Signed",
        description: `You signed: ${res.data.petition?.title || "a petition"}`,
        time: new Date().toLocaleString(),
      });
    } else {
      alert(res.data.message || "Failed to sign.");
    }
  } catch (e) {
    alert("Failed to sign petition.");
  }
};


// Unsign a petition
const handleUnsign = async (id) => {
  if (!window.confirm("Are you sure you want to remove your signature?")) return;
  try {
    const res = await axios.post(`${API_URL}/petition/${id}/unsign`, { userId: loggedInUserId });
    if (res.data.success) {
      alert("Signature removed successfully.");
      fetchPetitions();
    } else {
      alert(res.data.message || "Failed to unsign.");
    }
  } catch (e) {
    alert("Failed to remove signature.");
    console.error(e);
  }
};


  // ✅ Report Logic
  const openReportModal = (id) => {
    setSelectedPetitionId(id);
    setReportReason("Spam");
    setCustomReason(""); // Reset custom reason
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedPetitionId) return;
    
    // ✅ Logic for custom reason
    const finalReason = reportReason === "Other" 
        ? (customReason.trim() ? `Other: ${customReason}` : "Other") 
        : reportReason;

    try {
        const res = await axios.post(`${API_URL}/petition/${selectedPetitionId}/report`, {
            userId: loggedInUserId,
            reason: finalReason
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
                setNewPetition({ id: null, title: "", description: "", category: "Community", location: "" });
                setShowModal(true);
              }}>
                <Plus size={18}/> Create Petition
            </button>
        </div>

        {/* FIXED: Toolbar row → ONLY Tabs + Filters */}
<div className="petition-toolbar">

    {/* Left: Tabs */}
    <div className="petition-tabs">
        <button className={`petition-tab-btn ${activeTab==='all'?'active':''}`} onClick={()=>setActiveTab('all')}>
            All Petitions
        </button>
        <button className={`petition-tab-btn ${activeTab==='mine'?'active':''}`} onClick={()=>setActiveTab('mine')}>
            My Petitions
        </button>
        <button className={`petition-tab-btn ${activeTab==='signed'?'active':''}`} onClick={()=>setActiveTab('signed')}>
            Signed by Me
        </button>
    </div>

    {/* Middle: Filters */}
    <div className="filter-actions">
        <div className="filter-dropdown-container">
            <button className="filter-btn">
                <MapPin size={16}/> {filters.location === 'all' ? 'All Locations' : filters.location}
                <ChevronDown size={14}/>
            </button>
            <select name="location" value={filters.location} onChange={handleFilterChange} className="filter-select">
                <option value="all">All Locations</option>
                {allLocations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
        </div>

        <div className="filter-dropdown-container">
            <button className="filter-btn">
                <Filter size={16}/> {filters.category === 'all' ? 'All Categories' : filters.category}
                <ChevronDown size={14}/>
            </button>
            <select name="category" value={filters.category} onChange={handleFilterChange} className="filter-select">
                <option value="all">All Categories</option>
                <option value="Environment">Environment</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Community">Community</option>
            </select>
        </div>

        <div className="filter-dropdown-container">
            <button className="filter-btn">
                Status: {filters.status === 'all' ? 'All' : filters.status}
                <ChevronDown size={14}/>
            </button>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="review">Under Review</option>
                <option value="closed">Closed</option>
            </select>
    
        </div>
    </div>
    </div>
    <br/>

        {/* ✅ Cards Grid */}
    <div className="petition-list-wrapper">
        <div className="petition-list">
            {filteredPetitions.map(p => {
                const sigCount = p.signatures.length;
                const goal = p.goal ;
                const progress = Math.min((sigCount / goal) * 100, 100);
                const isOwner = p.createdBy === loggedInUserId;
                const isSigned = p.signatures.some(s => s.userId === loggedInUserId);
                const isActive = p.status === 'active' || p.status === 'approved';
                const isClosed = p.status === 'closed';

                return (
                    <div key={p._id || p.id} className="petition-card">
                        <div className="card-header-row">
                            <span className="category-badge">{p.category}</span>
                            <span className="time-ago">{timeAgo(p.createdAt)}</span>
                        </div>

                        <h3 className="card-title">{p.title}</h3>
                        
                        <div className="card-meta-row">
                            <span className="meta-item">By {p.author || "Anonymous"}</span>
                            <span className="meta-item"><MapPin size={14}/> {p.manualLocation || "Global"}</span>
                        </div>

                        <p className="card-desc">{p.description}</p>

                        <div className="progress-section">
                            <div className="progress-info">
                                <span>{sigCount} of {goal} signatures</span>
                                <span className="progress-status" style={{color: isClosed ? '#64748b' : (p.status === 'pending' || p.status === 'review' ? '#fbbf24' : '#16a34a')}}>
                                    {isClosed ? 'Closed' : (p.status === 'pending' || p.status === 'review' ? 'Under Review' : 'Active')}
                                </span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{width: `${progress}%`, backgroundColor: isClosed ? '#cbd5e1' : '#2563eb'}}></div>
                            </div>
                        </div>

                        <div className="card-footer">
                          <button className="view-details-btn" onClick={() => setViewPetition(p)}>
                            <Eye size={16} className="view-icon" />
                            View Details
                        </button>
                            
                            <div className="action-btn-group">

                                {/* Edit/Delete for Owner - ✅ Hide Edit if Closed */}
                                {isOwner && (
                                    <>
                                        {!isClosed && (
                                            <button className="icon-action-btn" title="Edit" onClick={() => openEditModal(p)}>
                                                <Edit2 size={16}/>
                                            </button>
                                        )}
                                        <button className="icon-action-btn delete" title="Delete" onClick={() => handleDelete(p._id || p.id)}>
                                            <Trash2 size={16}/>
                                        </button>
                                    </>
                                )}

                                <button className="icon-action-btn report" title="Report" onClick={() => openReportModal(p._id || p.id)}>
                                    <AlertCircle size={16} />
                                </button>

                                {/* Sign/Unsign Button - Hide if Closed */}
                               {isActive && !isClosed && (
                                <button 
                                  className={`sign-btn ${isSigned ? 'signed' : 'active'}`} 
                                  onClick={() => isSigned ? handleUnsign(p._id || p.id) : handleSign(p._id || p.id)}
                                  title={isSigned ? "Click to Remove Signature" : "Sign Petition"}
                                >
                                  {isSigned ? 'Signed (Remove)' : 'Sign Petition'}
                                </button>
                              )}
                              {isClosed && (
                                <button className="sign-btn" disabled style={{background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed'}}>
                                  Closed
                                </button>
                              )}

                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

    </div>

      {/* ✅ View Details Modal */}
      {viewPetition && (
          <div className="modal-overlay">
              <div className="modal">
                  <div className="modal-header">
                      <h3>Petition Details</h3>
                      <button className="modal-close" onClick={() => setViewPetition(null)}><X size={24}/></button>
                  </div>
                  
                  <div className="detail-row" style={{marginBottom: '1rem'}}>
                      <span className="detail-label" style={{fontWeight:600, color:'#64748b', fontSize:'0.85rem'}}>Title</span>
                      <div className="detail-value" style={{fontWeight:700, fontSize:'1.1rem'}}>{viewPetition.title}</div>
                  </div>
                  <div className="detail-row" style={{marginBottom: '1rem'}}>
                      <span className="detail-label" style={{fontWeight:600, color:'#64748b', fontSize:'0.85rem'}}>Description</span>
                      <div className="detail-value" style={{lineHeight:1.5}}>{viewPetition.description}</div>
                  </div>

                  <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem'}}>
                      <div>
                          <span className="detail-label" style={{fontWeight:600, color:'#64748b', fontSize:'0.85rem'}}>Category</span>
                          <div className="detail-value">{viewPetition.category}</div>
                      </div>
                      <div>
                          <span className="detail-label" style={{fontWeight:600, color:'#64748b', fontSize:'0.85rem'}}>Location</span>
                          <div className="detail-value">{viewPetition.manualLocation || 'Global'}</div>
                      </div>
                  </div>

                  <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem'}}>
                       <div>
                          <span className="detail-label" style={{fontWeight:600, color:'#64748b', fontSize:'0.85rem'}}>Status</span>
                          <div style={{textTransform:'capitalize', fontWeight:600, color: viewPetition.status==='active'?'#16a34a': viewPetition.status==='closed'?'#64748b':'#ea580c'}}>{viewPetition.status}</div>
                       </div>
                       <div>
                          <span className="detail-label" style={{fontWeight:600, color:'#64748b', fontSize:'0.85rem'}}>Progress</span>
                          <div>{viewPetition.signatures.length} / {viewPetition.goal || 100} Signatures</div>
                       </div>
                  </div>

                  <div className="modal-buttons" style={{marginTop:'2rem', display:'flex', justifyContent:'flex-end'}}>
                      <button className="submit-btn" onClick={() => setViewPetition(null)}>Close</button>
                  </div>
              </div>
          </div>
      )}

      {/* ✅ Create/Edit Modal */}
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
                    <input
                      placeholder="Select a Location"
                      value={newPetition.manualLocation} // <-- updated by LocationMarker
                      onChange={(e) => setNewPetition({ ...newPetition, manualLocation: e.target.value })}
                    />

                        <button
                          type="button"
                          onClick={() => setShowMapModal(true)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          Select Location on Map
                        </button>

                  </div>

              </div>

              <div className="form-group">
                <label>Signature Goal</label>
                <input type="number" value={newPetition.goal} onChange={(e) => setNewPetition({...newPetition, goal: Number(e.target.value)})} />
                <span className="form-helper">How many signatures are you aiming to collect?</span>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea required rows="4" value={newPetition.description} onChange={(e) => setNewPetition({...newPetition, description: e.target.value})} placeholder="Describe the issue and the change you'd like to see..."></textarea>
              </div>

              <div className="info-alert">
                <AlertCircle size={20} />
                <div>
                    <strong>Important Information</strong>
                    <p style={{margin:0}}>
                        {newPetition.id 
                         ? "Updating this petition will reset its status to 'Under Review'. It must be re-approved by an admin."
                         : "By submitting this petition, you acknowledge that the content is factual. Civix reserves the right to remove petitions."}
                    </p>
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

      {/* Report Modal */}
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
                
                {/* ✅ Added Textarea for 'Other' reason */}
                {reportReason === 'Other' && (
                    <textarea 
                        className="form-group" 
                        style={{marginTop:'0.5rem', width:'100%', padding:'0.5rem', minHeight:'80px', fontSize:'0.9rem'}}
                        placeholder="Please describe the issue..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                    />
                )}
            </div>
            <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="button" className="submit-btn" style={{background:'#dc2626'}} onClick={handleSubmitReport}>Submit Report</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
       {showMapModal && (
  <div className="modal-overlay">
    <div className="modal" style={{ maxWidth: '600px', width: '90%', height: '500px' }}>
      <div className="modal-header">
        <h3>Select Location</h3>
        <button className="modal-close" onClick={() => setShowMapModal(false)}><X size={24}/></button>
      </div>

      <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
          center={[
              newPetition.browserLocation?.latitude || 18.5204,
              newPetition.browserLocation?.longitude || 73.8567
            ]}

          zoom={13}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker
            position={selectedPosition}
            setPosition={setSelectedPosition}
            setNewPetition={setNewPetition}
          />

        </MapContainer>
     
        {selectedPosition === null && (
            <div className="map-instruction" style={{position:'absolute',top:10,left:10,zIndex:1000,background:'#fff',padding:'5px 10px',borderRadius:4}}>
              Click on map to select location
            </div>
          )}
         </div>

      <div className="modal-buttons" style={{marginTop:'1rem', display:'flex', justifyContent:'flex-end'}}>
        <button className="submit-btn" onClick={() => setShowMapModal(false)}>Done</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default PetitionsSection;