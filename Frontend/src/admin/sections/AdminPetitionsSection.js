import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  X,
  AlertCircle,
  Edit2 // Added Edit Icon
} from "../../assets/icons";
import "../../styles/AdminPetitions.css";

const API_URL = "http://localhost:8080";


const AdminPetitionsSection = () => {
    const [petitions, setPetitions] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Added ID for editing tracking
    const [newPetition, setNewPetition] = useState({ id: null, title: '', description: '', category: 'Community', location: '', goal: 100 });
    const [error, setError] = useState(null);

    const getAdminId = () => localStorage.getItem("id") || 'admin';

    const fetchPetitions = async () => {
      try {
        setError(null);
        const res = await axios.get(`${API_URL}/petition/all`);
        if (res.data.success) {
          // Map isClosed to a UI status
          const formattedData = res.data.data.map(p => ({
            ...p,
            status: p.isClosed ? 'closed' : (p.status === 'approved' ? 'active' : p.status),
            signatures: Array.isArray(p.signatures) ? p.signatures.length : (p.signatures || 0),
            reports: p.reports || 0
          }));
          setPetitions(formattedData);
        }
      } catch (err) {
        console.error("Error fetching petitions:", err);
        setError("Could not connect to backend server. Ensure it is running on localhost:8080");
      }
    };

    useEffect(() => {
      fetchPetitions();
    }, []);

    const getOwnerId = (petitionId) => {
      const petition = petitions.find(p => (p._id === petitionId || p.id === petitionId));
      return petition ? (petition.createdBy || petition.userId || getAdminId()) : getAdminId();
    };

    const handleApprove = async (id) => {
        if(!window.confirm("Approve this petition to go Active?")) return;
        try {
            const res = await axios.post(`${API_URL}/petition/${id}/approve`, { userId: getAdminId() });
            if (res.data.success) {
                alert("✅ Petition Approved!");
                setTimeout(fetchPetitions, 500); 
            }
        } catch (err) {
            alert("Failed to approve petition.");
        }
    };

    const handleClose = async (id) => {
      if(!window.confirm("Close this petition? Users will no longer be able to sign.")) return;
      
      const updateUIClosed = () => {
          setPetitions(prev => prev.map(p => (p._id === id || p.id === id) ? {...p, status: 'closed'} : p));
      };

      try {
          const ownerId = getOwnerId(id);
          await axios.post(`${API_URL}/petition/${id}/close`, { userId: ownerId })
            .catch(async () => {
                await axios.post(`${API_URL}/petition/${id}/close`, { userId: getAdminId() });
            });
          alert("🔒 Petition Closed.");
          updateUIClosed();
          setTimeout(fetchPetitions, 500);
      } catch (err) {
          alert("Failed to close petition. Unauthorized action.");
      }
    };

    const handleDelete = async (id) => {
      if(!window.confirm("Delete permanently?")) return;
      
      const removeUI = () => {
          setPetitions(prev => prev.filter(p => p._id !== id && p.id !== id));
      };

      try {
          const ownerId = getOwnerId(id);
          await axios.post(`${API_URL}/petition/${id}/delete`, { userId: ownerId })
            .catch(async () => {
               await axios.post(`${API_URL}/petition/${id}/delete`, { userId: getAdminId() });
            });
          alert("🗑️ Petition Deleted.");
          removeUI();
          setTimeout(fetchPetitions, 500);
      } catch(err) {
          alert("Failed to delete petition. Unauthorized action.");
      }
    };

    // ✅ Handle Open Create/Edit Modal
    const openModal = (petition = null) => {
        if (petition) {
            // Edit Mode
            setNewPetition({
                id: petition._id || petition.id,
                title: petition.title,
                description: petition.description,
                category: petition.category,
                location: petition.manualLocation || '',
                goal: petition.signatureGoal || 100
            });
        } else {
            // Create Mode
            setNewPetition({ id: null, title: '', description: '', category: 'Community', location: '', goal: 100 });
        }
        setIsModalOpen(true);
    };

    // ✅ Create or Update Petition
    const handleCreateOrUpdate = async (e) => {
      e.preventDefault();
      
      try {
        if (newPetition.id) {
            // --- UPDATE EXISTING ---
            const payload = {
                title: newPetition.title,
                description: newPetition.description,
                category: newPetition.category,
                manualLocation: newPetition.location,
                signatureGoal: newPetition.goal,
                userId: getAdminId() // Admin overrides
            };
            await axios.put(`${API_URL}/petition/${newPetition.id}/update`, payload);
            alert("✅ Petition Updated Successfully!");
        } else {
            // --- CREATE NEW ---
            await axios.post(`${API_URL}/petition/create`, {
                title: newPetition.title,
                description: newPetition.description,
                category: newPetition.category,
                manualLocation: newPetition.location || "Official",
                signatureGoal: newPetition.goal,
                createdBy: getAdminId(),
                status: "approved" 
            });
            alert("✅ Official Petition Created & Published!");
        }

        setIsModalOpen(false);
        setTimeout(fetchPetitions, 500);
      } catch (err) {
        console.error("Error saving:", err);
        alert("Failed to save petition. Backend might be down.");
      }
    };

    const filteredPetitions = useMemo(() => {
      return petitions.filter(p => {
        const title = typeof p.title === 'string' ? p.title : '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
        
        let statusMatch = true;
        if (filterStatus === 'review') statusMatch = p.status === 'review' || p.status === 'pending';
        else if (filterStatus === 'active') statusMatch = p.status === 'active';
        else if (filterStatus === 'closed') statusMatch = p.status === 'closed';
        
        return matchesSearch && statusMatch;
      });
    }, [petitions, searchTerm, filterStatus]);

    const stats = {
      total: petitions.length,
      review: petitions.filter(p => p.status === 'review' || p.status === 'pending').length,
      active: petitions.filter(p => p.status === 'active').length,
      closed: petitions.filter(p => p.status === 'closed').length,
      reported: petitions.filter(p => (p.reports || 0) > 0).length
    };

    return (
        <div className="admin-petitions-container">
            <div className="admin-header-row">
              <div>
                <h2 className="admin-page-title">Manage Petitions</h2>
                <p className="admin-page-subtitle">Review, approve, and create community petitions.</p>
              </div>
              <button className="primary-btn" onClick={() => openModal(null)}>
                <Plus size={18} /> Create Petition
              </button>
            </div>

            {error && <div className="error-banner"><strong>Error: </strong> {error}</div>}

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon-wrapper" style={{background: '#e0f2fe', color: '#0284c7', marginRight:'1rem'}}><FileText size={24} /></div>
                <div><h3>{stats.total}</h3><p style={{margin:0, color:'#64748b'}}>Total</p></div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-icon-wrapper" style={{background: '#fff7ed', color: '#ea580c', marginRight:'1rem'}}><Clock size={24} /></div>
                <div><h3>{stats.review}</h3><p style={{margin:0, color:'#64748b'}}>Under Review</p></div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-icon-wrapper" style={{background: '#dcfce7', color: '#16a34a', marginRight:'1rem'}}><CheckCircle size={24} /></div>
                <div><h3>{stats.active}</h3><p style={{margin:0, color:'#64748b'}}>Active</p></div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-icon-wrapper" style={{background: '#fef2f2', color: '#dc2626', marginRight:'1rem'}}><AlertCircle size={24} /></div>
                <div><h3>{stats.reported}</h3><p style={{margin:0, color:'#64748b'}}>Reported</p></div>
              </div>
            </div>

            <div className="admin-controls-bar">
                <div className="search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input type="text" placeholder="Search petitions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                    <thead>
                        <tr><th>Petition Details</th><th>Signatures</th><th>Status</th><th>Reports</th><th style={{textAlign:'right'}}>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filteredPetitions.length > 0 ? filteredPetitions.map(p => (
                            <tr key={p.id || p._id}>
                                <td>
                                  <div style={{fontWeight:600, color:'#0f172a'}}>{p.title}</div>
                                  <div style={{fontSize:'0.8rem', color:'#64748b'}}>
                                    {p.category} • {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'} • By {p.author && typeof p.author === 'object' ? (p.author.name || 'User') : (p.author || 'User')}
                                  </div>
                                </td>
                                <td>
                                  <span className="status-pill generic">
                                    {Array.isArray(p.signatures) ? p.signatures.length : (typeof p.signatures === 'number' ? p.signatures : 0)} Signed
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-pill ${p.status === 'active' ? 'active' : p.status === 'closed' ? 'closed' : 'review'}`}>
                                    {p.status === 'review' || p.status === 'pending' ? 'Review' : p.status === 'approved' ? 'Active' : p.status}
                                  </span>
                                </td>
                                <td>{p.reports > 0 ? <span className="report-badge"><AlertCircle size={12}/> {p.reports}</span> : <span style={{color:'#cbd5e1'}}>-</span>}</td>
                                <td>
                                    <div className="admin-row-actions">
                                      {/* EDIT Button for Admin */}
                                      <button className="action-btn edit" onClick={() => openModal(p)} title="Edit"><Edit2 size={18}/></button>

                                      {(p.status === 'review' || p.status === 'pending') && (
                                          <button className="action-btn success" onClick={() => handleApprove(p.id || p._id)} title="Approve"><CheckCircle size={18}/></button>
                                      )}
                                      {(p.status === 'active') && (
                                          <button className="action-btn warning" onClick={() => handleClose(p.id || p._id)} title="Close"><XCircle size={18}/></button>
                                      )}
                                      <button className="action-btn danger" onClick={() => handleDelete(p.id || p._id)} title="Delete"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                          <tr><td colSpan="5" style={{padding:'2rem', textAlign:'center', color:'#94a3b8'}}>No petitions found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>{newPetition.id ? "Edit Petition" : "Create Official Petition"}</h3>
                    <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={24}/></button>
                  </div>
                  <form onSubmit={handleCreateOrUpdate}>
                    <div className="form-group">
                      <label>Title</label>
                      <input required value={newPetition.title} onChange={(e) => setNewPetition({...newPetition, title: e.target.value})} placeholder="Petition Title"/>
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
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Location</label>
                        <input value={newPetition.location} onChange={(e) => setNewPetition({...newPetition, location: e.target.value})} placeholder="Select a Location" />
                      </div>
                    </div>

                    <div className="form-group">
                        <label>Signature Goal</label>
                        <input type="number" value={newPetition.goal} onChange={(e) => setNewPetition({...newPetition, goal: e.target.value})} />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea required rows="4" value={newPetition.description} onChange={(e) => setNewPetition({...newPetition, description: e.target.value})} placeholder="Describe the petition..."></textarea>
                    </div>

                    <div className="info-alert">
                        <AlertCircle size={20} />
                        <div>
                            <strong>Admin Action</strong>
                            <p style={{margin:0}}>You are editing content visible to the public. Ensure all details follow community guidelines.</p>
                        </div>
                    </div>

                    <div className="modal-actions">
                      <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                      <button type="submit" className="primary-btn">{newPetition.id ? "Update Petition" : "Publish Petition"}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
        </div>
    );
};

export default AdminPetitionsSection;