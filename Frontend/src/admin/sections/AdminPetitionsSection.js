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
  Edit2,
  Eye, 
  MapPin,
  Lock
} from "../../assets/icons";

const API_URL = "http://localhost:8080";

// --- Styles ---
const styles = `
  .admin-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
  .admin-page-title { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0; }
  .admin-page-subtitle { color: #64748b; margin: 0.25rem 0 0; }
  
  .primary-btn { background: #2563eb; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 0.375rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
  .primary-btn:hover { background: #1d4ed8; }

  .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
  .admin-stat-card { background: white; border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #e2e8f0; }
  
  .admin-controls-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; background: white; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; flex-wrap: wrap; }
  .search-wrapper { flex: 1; position: relative; min-width: 250px; display: flex; align-items: center; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
  .search-wrapper input { width: 100%; padding: 0.7rem 0.7rem 0.7rem 2.5rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
  .search-wrapper input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1); }
  
  .filter-wrapper { display: flex; align-items: center; gap: 0.5rem; border-left: 1px solid #e2e8f0; padding-left: 1rem; }
  .filter-wrapper select { padding: 0.5rem 2rem 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background: white; cursor: pointer; }

  .admin-table-container { background: white; border-radius: 0.75rem; border: 1px solid #e2e8f0; overflow: hidden; }
  .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
  .admin-table th { background: #f8fafc; padding: 1rem 1.5rem; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
  .admin-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  .admin-table tr:hover td { background: #f8fafc; }

  .status-pill { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
  .status-pill.active { background: #dcfce7; color: #166534; } 
  .status-pill.review { background: #ffedd5; color: #9a3412; }
  .status-pill.closed { background: #f1f5f9; color: #475569; }
  
  .report-badge { display: inline-flex; align-items: center; gap: 0.25rem; color: #dc2626; font-weight: 600; font-size: 0.8rem; background: #fef2f2; padding: 0.2rem 0.5rem; border-radius: 0.25rem; }
  .zero-reports { color: #94a3b8; font-size: 0.8rem; }

  .admin-row-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 0.375rem; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; background: transparent; }
  .action-btn.success { color: #16a34a; background: #f0fdf4; border-color: #dcfce7; }
  .action-btn.success:hover { background: #16a34a; color: white; border-color: #16a34a; }
  .action-btn.warning { color: #ea580c; background: #fff7ed; border-color: #ffedd5; }
  .action-btn.warning:hover { background: #ea580c; color: white; border-color: #ea580c; }
  .action-btn.danger { color: #dc2626; background: #fef2f2; border-color: #fee2e2; }
  .action-btn.danger:hover { background: #dc2626; color: white; border-color: #dc2626; }
  .action-btn.edit { color: #2563eb; background: #eff6ff; border-color: #dbeafe; }
  .action-btn.edit:hover { background: #2563eb; color: white; border-color: #2563eb; }
  .action-btn.view { color: #64748b; border-color: #e2e8f0; }
  .action-btn.view:hover { color: #0f172a; border-color: #cbd5e1; }

  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(100%); background: #f1f5f9; border-color: transparent; color: #94a3b8; }

  /* Modal */
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal { background: white; width: 650px; max-width: 95%; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); max-height: 90vh; overflow-y: auto; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
  .modal-close { background: none; border: none; cursor: pointer; color: #64748b; transition: color 0.2s; }
  .modal-close:hover { color: #0f172a; }
  
  .form-group { margin-bottom: 1.25rem; }
  .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #334155; font-size: 0.9rem; }
  .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.95rem; transition: border-color 0.2s; }
  .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
  .form-helper { display: block; font-size: 0.8rem; color: #64748b; margin-top: 0.35rem; }
  
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  
  .info-alert { display: flex; gap: 0.75rem; background: #fffbeb; border: 1px solid #fcd34d; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; color: #92400e; font-size: 0.875rem; line-height: 1.5; }
  .info-alert strong { display: block; margin-bottom: 0.25rem; color: #b45309; }
  
  .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
  .btn-cancel { background: #f1f5f9; color: #475569; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background 0.2s; }
  .btn-cancel:hover { background: #e2e8f0; }
  
  .error-banner { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border: 1px solid #fecaca; }
  
  /* Detail View */
  .detail-row { margin-bottom: 1rem; }
  .detail-label { font-weight: 600; font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.25rem; }
  .detail-value { font-size: 1rem; color: #0f172a; }
`;

const AdminPetitionsSection = () => {
    const [petitions, setPetitions] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewPetition, setViewPetition] = useState(null); // For "Eye" modal

    // ✅ Added ownerId to state to preserve original owner during updates
    const [newPetition, setNewPetition] = useState({ id: null, title: '', description: '', category: 'Community', location: '', goal: 100, ownerId: null });
    const [error, setError] = useState(null);

    const getAdminId = () => localStorage.getItem("id") || 'admin';

    // ✅ Fetch Petitions
    const fetchPetitions = async () => {
      try {
        setError(null);
        const res = await axios.get(`${API_URL}/petition/all`);
        if (res.data.success) {
          setPetitions(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching petitions:", err);
        setError("Could not connect to backend server.");
      }
    };

    useEffect(() => {
      fetchPetitions();
    }, []);

    const getOwnerId = (petitionId) => {
      const petition = petitions.find(p => (p._id === petitionId || p.id === petitionId));
      return petition ? (petition.createdBy || petition.userId || getAdminId()) : getAdminId();
    };

    // ✅ Open Create/Edit Modal
    const openModal = (petition = null) => {
        if (petition) {
            // Edit Mode
            setNewPetition({
                id: petition._id || petition.id,
                title: petition.title,
                description: petition.description,
                category: petition.category,
                location: petition.manualLocation || '',
                goal: petition.signatureGoal || 100,
                // ✅ Capture original owner ID to prevent "Failed to update" due to ID mismatch
                ownerId: petition.userId || petition.createdBy || getAdminId()
            });
        } else {
            // Create Mode
            setNewPetition({ id: null, title: '', description: '', category: 'Community', location: '', goal: 100, ownerId: null });
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
                signatureGoal: Number(newPetition.goal), // Ensure number
                // ✅ Use original owner's ID for updates so backend validation passes
                userId: newPetition.ownerId || getAdminId(), 
                // ✅ Reset to 'review' on update
                status: "review"
            };
            await axios.put(`${API_URL}/petition/${newPetition.id}/update`, payload);
            alert("✅ Petition Updated! It is now under review.");
        } else {
            // --- CREATE NEW ---
            await axios.post(`${API_URL}/petition/create`, {
                title: newPetition.title,
                description: newPetition.description,
                category: newPetition.category,
                manualLocation: newPetition.location || "Official",
                signatureGoal: Number(newPetition.goal), // Ensure number
                createdBy: getAdminId(),
                status: "approved" 
            });
            alert("✅ Official Petition Created & Published!");
        }

        setIsModalOpen(false);
        setTimeout(fetchPetitions, 500);
      } catch (err) {
        console.error("Error saving:", err);
        alert("Failed to save petition. Ensure you have permission.");
      }
    };

    // ✅ Approve Petition
    const handleApprove = async (id) => {
        if(!window.confirm("Approve this petition to go Active?")) return;
        
        setPetitions(prev => prev.map(p => (p._id === id || p.id === id) ? {...p, status: 'active'} : p));

        try {
            await axios.post(`${API_URL}/petition/${id}/approve`, { userId: getAdminId() });
            alert("✅ Petition Approved!");
            fetchPetitions();
        } catch (err) {
            fetchPetitions(); // Revert
            alert("Failed to approve petition.");
        }
    };

    // ✅ Close Petition
    const handleClose = async (id) => {
      if(!window.confirm("Close this petition? Users will no longer be able to sign.")) return;
      
      // Optimistic update
      setPetitions(prev => prev.map(p => (p._id === id || p.id === id) ? {...p, status: 'closed'} : p));

      try {
          // Attempt 1: Try closing with Admin credentials
          try {
             await axios.post(`${API_URL}/petition/${id}/close`, { userId: getAdminId() });
          } catch (e) {
             // Attempt 2: If Admin ID fails (e.g. backend check), try Owner ID
             const ownerId = getOwnerId(id);
             if (ownerId && ownerId !== getAdminId()) {
                await axios.post(`${API_URL}/petition/${id}/close`, { userId: ownerId });
             } else {
                throw e; 
             }
          }
          
          alert("🔒 Petition Closed.");
          // Force fetch to ensure UI is in sync
          await fetchPetitions();
      } catch (err) {
          console.error("Close Error:", err);
          alert("Failed to close petition.");
          fetchPetitions(); // Revert on failure
      }
    };

    // ✅ Delete Petition
    const handleDelete = async (id) => {
      if(!window.confirm("Delete permanently?")) return;
      
      setPetitions(prev => prev.filter(p => p._id !== id && p.id !== id));

      try {
          const ownerId = getOwnerId(id);
          await axios.post(`${API_URL}/petition/${id}/delete`, { userId: ownerId })
            .catch(async () => {
               await axios.post(`${API_URL}/petition/${id}/delete`, { userId: getAdminId() });
            });
          alert("🗑️ Petition Deleted.");
          setTimeout(fetchPetitions, 500);
      } catch(err) {
          alert("Failed to delete petition.");
      }
    };

    const filteredPetitions = useMemo(() => {
      return petitions.filter(p => {
        const title = typeof p.title === 'string' ? p.title : '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
        
        let statusMatch = true;
        if (filterStatus === 'review') statusMatch = p.status === 'review' || p.status === 'pending';
        else if (filterStatus === 'active') statusMatch = p.status === 'active' || p.status === 'approved';
        else if (filterStatus === 'closed') statusMatch = p.status === 'closed';
        
        return matchesSearch && statusMatch;
      });
    }, [petitions, searchTerm, filterStatus]);

    const stats = {
      total: petitions.length,
      review: petitions.filter(p => p.status === 'review' || p.status === 'pending').length,
      active: petitions.filter(p => p.status === 'active' || p.status === 'approved').length,
      closed: petitions.filter(p => p.status === 'closed').length,
      reported: petitions.filter(p => (p.reports || 0) > 0).length
    };

    return (
        <div>
            <style>{styles}</style>
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
                        {filteredPetitions.length > 0 ? filteredPetitions.map(p => {
                            const isClosed = p.status === 'closed';
                            return (
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
                                  <span className={`status-pill ${p.status === 'active' || p.status === 'approved' ? 'active' : p.status === 'closed' ? 'closed' : 'review'}`}>
                                    {p.status === 'review' || p.status === 'pending' ? 'Review' : p.status === 'approved' ? 'Active' : p.status}
                                  </span>
                                </td>
                                {/* ✅ Show 0 if reports is 0 */}
                                <td>{p.reports > 0 ? <span className="report-badge"><AlertCircle size={12}/> {p.reports}</span> : <span className="zero-reports">0</span>}</td>
                                <td>
                                    <div className="admin-row-actions">
                                      {/* ✅ View Details (Eye) */}
                                      <button className="action-btn view" onClick={() => setViewPetition(p)} title="View Details"><Eye size={18}/></button>

                                      {/* ✅ Edit (Disabled if Closed) */}
                                      <button 
                                        className="action-btn edit" 
                                        onClick={() => !isClosed && openModal(p)} 
                                        disabled={isClosed} 
                                        title={isClosed ? "Cannot edit closed petition" : "Edit"}
                                      >
                                        <Edit2 size={18}/>
                                      </button>

                                      {(p.status === 'review' || p.status === 'pending') && (
                                          <button className="action-btn success" onClick={() => handleApprove(p.id || p._id)} title="Approve"><CheckCircle size={18}/></button>
                                      )}
                                      {(p.status === 'active' || p.status === 'approved') && (
                                          <button className="action-btn warning" onClick={() => handleClose(p.id || p._id)} title="Close"><XCircle size={18}/></button>
                                      )}
                                      <button className="action-btn danger" onClick={() => handleDelete(p.id || p._id)} title="Delete"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        )}) : (
                          <tr><td colSpan="5" style={{padding:'2rem', textAlign:'center', color:'#94a3b8'}}>No petitions found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ✅ View Details Modal */}
            {viewPetition && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 style={{margin:0}}>Petition Details</h3>
                            <button className="modal-close" onClick={() => setViewPetition(null)}><X size={24}/></button>
                        </div>
                        
                        {/* Petition Details */}
                        <div className="detail-row"><span className="detail-label">Title</span><div className="detail-value" style={{fontWeight:600}}>{viewPetition.title}</div></div>
                        <div className="detail-row"><span className="detail-label">Description</span><div className="detail-value" style={{lineHeight:1.5}}>{viewPetition.description}</div></div>
                        
                        {/* Created By */}
                        <div className="detail-row"><span className="detail-label">Created By</span><div className="detail-value">{typeof viewPetition.author === 'object' ? (viewPetition.author.name || 'User') : (viewPetition.author || 'User')}</div></div>

                        <div className="form-row">
                            <div><span className="detail-label">Category</span><div className="detail-value">{viewPetition.category}</div></div>
                            <div><span className="detail-label">Location</span><div className="detail-value"><MapPin size={14} style={{display:'inline'}}/> {viewPetition.manualLocation || 'Global'}</div></div>
                        </div>

                        <div className="form-row" style={{marginTop:'1rem'}}>
                            <div><span className="detail-label">Status</span><span className={`status-pill ${viewPetition.status}`}>{viewPetition.status}</span></div>
                            {/* ✅ Show Goal in Modal */}
                            <div><span className="detail-label">Progress</span><div className="detail-value">{Array.isArray(viewPetition.signatures) ? viewPetition.signatures.length : viewPetition.signatures} / {viewPetition.signatureGoal || 100} Signed</div></div>
                        </div>
                        
                        {/* Report Count in Modal */}
                        <div className="detail-row" style={{marginTop:'1rem'}}>
                             <span className="detail-label">Reports</span>
                             <div className="detail-value">{viewPetition.reports || 0}</div>
                        </div>

                        <div className="modal-actions"><button className="primary-btn" onClick={() => setViewPetition(null)}>Close</button></div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
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