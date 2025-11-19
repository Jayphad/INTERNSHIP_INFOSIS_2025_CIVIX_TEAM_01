import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, CheckCircle, XCircle, Trash2, 
  BarChart2, AlertCircle, Clock
} from '../../assets/icons';

import '../../styles/AdminPolls.css';

// --- Styles (Inline for preview, move to CSS in real app) ---
// Default fallback data matching User structure to prevent corruption
const mockAdminPolls = [
  { id: 1, question: "Should the city invest in a new public library downtown?", authorName: "Jay Vijay", category: "community", totalVotes: 240, status: "active", createdAt: "2023-10-25", reports: 0, votedBy: [], userVote: {} },
  { id: 2, question: "What should be the priority for the new park?", authorName: "Demo User", category: "local_gov", totalVotes: 570, status: "review", createdAt: "2023-11-01", reports: 0, votedBy: [], userVote: {} },
];

const AdminPollsSection = () => {
  // ✅ Connection: Load from same localStorage key
  const [polls, setPolls] = useState(() => {
    const saved = localStorage.getItem('civix_polls');
    if (saved) {
        try {
            // FIX: Ensure every loaded poll has votedBy array
            const parsed = JSON.parse(saved);
            return parsed.map(p => ({
                ...p,
                votedBy: p.votedBy || [],
                userVote: p.userVote || {}
            }));
        } catch (e) {
            return mockAdminPolls;
        }
    }
    return mockAdminPolls;
  });

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Connection: Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('civix_polls', JSON.stringify(polls));
  }, [polls]);

  // Actions
  const handleApprove = (id) => {
    if(window.confirm("Approve this poll to go live?")) {
      setPolls(polls.map(p => p.id === id ? { ...p, status: 'active' } : p));
    }
  };

  const handleClose = (id) => {
    if(window.confirm("Close this poll? Users will no longer be able to vote.")) {
      setPolls(polls.map(p => p.id === id ? { ...p, status: 'closed' } : p));
    }
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to DELETE this poll?")) {
      setPolls(polls.filter(p => p.id !== id));
    }
  };

  const filteredPolls = useMemo(() => {
    return polls.filter(poll => {
      // Use 'question' and 'authorName' to match user structure
      const matchesSearch = poll.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            poll.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' ? true : poll.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [polls, searchTerm, filterStatus]);

  const stats = {
    total: polls.length,
    review: polls.filter(p => p.status === 'review').length,
    reported: polls.filter(p => (p.reports || 0) > 0).length,
  };

  return (
    <div className="admin-petitions-container">
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-title">Manage Community Polls</h2>
          
        </div>
        <p className="admin-page-subtitle">Review community polls, moderate content, and track engagement.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{background: '#e0f2fe', color: '#0284c7'}}>
            <BarChart2 size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Polls</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{background: '#fff7ed', color: '#ea580c'}}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.review}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{background: '#fef2f2', color: '#dc2626'}}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.reported}</h3>
            <p>Reported</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="admin-controls-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search polls by question or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-wrapper">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="review">Under Review</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Poll Details</th>
              <th>Author</th>
              <th>Stats</th>
              <th>Status</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPolls.length > 0 ? (
              filteredPolls.map(poll => (
                <tr key={poll.id}>
                  <td>
                    {/* Maps 'question' instead of 'title' */}
                    <div className="cell-primary-text">{poll.question}</div>
                    <div className="cell-secondary-text">{poll.category} • {poll.createdAt}</div>
                    {(poll.reports || 0) > 0 && (
                      <span className="report-count high">
                         <AlertCircle size={12} /> {poll.reports}
                      </span>
                    )}
                  </td>
                  <td>{poll.authorName}</td>
                  <td>
                    <div className="status-pill generic">
                       {poll.totalVotes || 0} Votes
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${poll.status}`}>
                      {poll.status === 'review' ? 'Review' : poll.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                       {/* Review Logic */}
                       {poll.status === 'review' && (
                         <button 
                           className="icon-btn success" 
                           title="Approve"
                           onClick={() => handleApprove(poll.id)}
                         >
                           <CheckCircle size={18} />
                         </button>
                       )}

                       {/* Active Logic */}
                       {poll.status === 'active' && (
                         <button 
                           className="icon-btn warning" 
                           title="Close Poll"
                           onClick={() => handleClose(poll.id)}
                         >
                           <XCircle size={18} />
                         </button>
                       )}
                       
                       {/* Delete Logic */}
                       <button 
                         className="icon-btn danger" 
                         title="Delete"
                         onClick={() => handleDelete(poll.id)}
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
               <tr>
                 <td colSpan="5" className="no-data-cell" style={{padding: '2rem', textAlign:'center', color: '#94a3b8'}}>
                   No polls found matching your criteria.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPollsSection;