import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart2,
  Plus,
  AlertCircle,
  PlusCircle,
  Trash2,
  CheckSquare,
  MapPin,
  Check,
  Clock,
  X
} from '../../assets/icons';

// --- IMPORTANT: Uncomment these lines in your local project ---
import '../../styles/Polls.css'; 
import '../../styles/Modal.css';

// --- Helper Components ---
const FormButton = ({ children, variant = 'primary', className = '', ...props }) => {
  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Robust User ID Helper ---
const getUserId = (user) => {
  const storedId = localStorage.getItem("id") || localStorage.getItem("userId");
  if (storedId) return storedId;
  if (user) {
    return user.uid || user.userId || user._id || user.id || null;
  }
  return null;
};

// --- Mock Poll Data (Initial Fallback) ---
const mockPolls = [
  {
    id: 1,
    question: "Should the city invest in a new public library downtown?",
    description: "The current library is outdated. A new, modern facility could offer more resources.",
    options: [
      { id: 'opt1', text: "Yes, a new library is crucial" },
      { id: 'opt2', text: "No, we should upgrade the old one" },
      { id: 'opt3', text: "No, funds are needed elsewhere" },
    ],
    results: { 'opt1': 120, 'opt2': 75, 'opt3': 45 },
    totalVotes: 240,
    authorId: "user_jay_456",
    authorName: "Jay Vijay",
    location: "Delhi, India",
    category: "community",
    status: "active",
    votedBy: ["user_jay_456"],
    userVote: { "user_jay_456": "opt1" },
    closesOn: "2025-11-20",
    createdAt: "2023-10-25"
  }
];

// --- Create Poll Form ---
const CreatePollForm = ({ user, onSave, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([
    { id: 1, text: '' },
    { id: 2, text: '' }
  ]);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [closesOn, setClosesOn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptionChange = (index, value) => {
    const newOptions = options.map((opt, i) => {
        if (i === index) {
            return { ...opt, text: value };
        }
        return opt;
    });
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: Date.now(), text: '' }]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userId = getUserId(user);
    const userName = user?.name || user?.username || "Anonymous";

    if (!userId) {
        setError("You must be logged in to create a poll.");
        return;
    }

    if (!question || !location || !closesOn || !category) {
      setError("Please fill out all required fields.");
      return;
    }
    const validOptions = options.filter(opt => opt.text.trim() !== '');
    if (validOptions.length < 2) {
      setError("Please provide at least 2 valid poll options.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const pollData = {
      question,
      description,
      options: validOptions.map((opt, i) => ({ id: `opt_${Date.now()}_${i}`, text: opt.text })),
      location,
      category,
      closesOn,
      authorId: userId,
      authorName: userName,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Simulate API call
    setTimeout(() => {
      const initialResults = {};
      pollData.options.forEach(opt => {
        initialResults[opt.id] = 0;
      });

      const newPoll = {
        ...pollData,
        id: Math.floor(Math.random() * 100000),
        results: initialResults,
        totalVotes: 0,
        status: "review", 
        votedBy: [],
        userVote: {}
      };
      onSave(newPoll);
      setIsLoading(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="petition-create-form">
      {error && <div className="auth-error-banner">{error}</div>}

      <div className="form-field-group">
        <label htmlFor="poll_question">Poll Question *</label>
        <input 
          type="text" 
          id="poll_question" 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you want to ask?" 
          required
        />
      </div>

      <div className="form-field-group">
        <label htmlFor="poll_description">Description</label>
        <textarea 
          id="poll_description" 
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Context..."
        ></textarea>
      </div>

      <div className="form-field-group">
        <label>Poll Options *</label>
        <div className="poll-options-list">
          {options.map((opt, index) => (
            <div key={index} className="poll-option-input">
              <CheckSquare size={20} className="poll-option-icon" />
              <input 
                type="text" 
                value={opt.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required={index < 2} 
              />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(index)} className="poll-option-remove-btn">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 10 && (
          <button type="button" onClick={addOption} className="poll-add-option-btn">
            <PlusCircle size={16} /> Add Option
          </button>
        )}
      </div>

      <div className="form-field-row">
         <div className="form-field-group">
            <label htmlFor="poll_category">Category *</label>
            <select 
              id="poll_category" 
              name="category"
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select a category</option>
              <option value="community">Community</option>
              <option value="environment">Environment</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="local_gov">Local Government</option>
            </select>
          </div>
          <div className="form-field-group">
            <label htmlFor="poll_location">Location *</label>
            <input 
              type="text" 
              id="poll_location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Delhi, India" 
              required
            />
          </div>
      </div>
       <div className="form-field-group">
          <label htmlFor="poll_closes">Closes On *</label>
          <input 
            type="date" 
            id="poll_closes" 
            value={closesOn}
            onChange={(e) => setClosesOn(e.target.value)}
            required
          />
        </div>
      
      <div className="form-action-buttons">
        <FormButton 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </FormButton>
        <FormButton 
          type="submit" 
          variant="primary" 
          disabled={isLoading}
        >
          {isLoading ? "Publishing..." : "Publish Poll"}
        </FormButton>
      </div>
    </form>
  );
};

// --- Main PollsSection Component ---
const PollsSection = ({ user }) => {
  const [polls, setPolls] = useState(() => {
    const saved = localStorage.getItem('civix_polls');
    // FIX: Ensure loaded data has valid structure (votedBy array)
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return parsed.map(p => ({
                ...p,
                votedBy: p.votedBy || [], 
                userVote: p.userVote || {}
            }));
        } catch (e) {
            return mockPolls;
        }
    }
    return mockPolls;
  });

  const [view, setView] = useState('all'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    location: 'all',
  });

  useEffect(() => {
    localStorage.setItem('civix_polls', JSON.stringify(polls));
  }, [polls]);
  
  const allLocations = useMemo(() => {
    return [...new Set(polls.map(p => p.location))].filter(Boolean);
  }, [polls]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePoll = (newPoll) => {
    setPolls(prev => [newPoll, ...prev]);
    setIsModalOpen(false);
    alert("Poll created! It is now 'Under Review'.");
    setView('my_polls'); 
  };

  const handleVote = async (pollId, optionId, poll) => {
    const userId = getUserId(user);
    if (!userId) {
        alert("Please sign in to vote.");
        return;
    }

    // Quick update (100ms) to ensure localStorage save happens fast
    setTimeout(() => {
        const currentCount = poll.results[optionId] || 0;
        const newResults = {
            ...poll.results,
            [optionId]: currentCount + 1,
        };
        const updatedPoll = {
            ...poll,
            results: newResults,
            totalVotes: poll.totalVotes + 1,
            votedBy: [...(poll.votedBy || []), userId],
            userVote: { ...(poll.userVote || {}), [userId]: optionId }
        };
        
        setPolls(prevPolls => 
            prevPolls.map(p => p.id === pollId ? updatedPoll : p)
        );
    }, 100);
  };
  
  const handleReportPoll = (pollId) => {
    alert("Reported.");
  };

  const dropdownFilteredPolls = polls.filter(p => {
    return (filters.status === 'all' || p.status === filters.status) &&
           (filters.category === 'all' || p.category === filters.category) &&
           (filters.location === 'all' || p.location === filters.location);
  });
  
  let pollsToDisplay = [];
  const currentUserId = getUserId(user);

  if (view === 'all') {
    pollsToDisplay = dropdownFilteredPolls.filter(p => p.status !== 'review');
  } else if (view === 'active') {
    pollsToDisplay = dropdownFilteredPolls.filter(p => p.status === 'active');
  } else if (view === 'voted') {
    pollsToDisplay = currentUserId ? dropdownFilteredPolls.filter(p => (p.votedBy || []).includes(currentUserId)) : [];
  } else if (view === 'my_polls') {
    pollsToDisplay = currentUserId ? dropdownFilteredPolls.filter(p => p.authorId === currentUserId) : [];
  } else if (view === 'closed') {
    pollsToDisplay = dropdownFilteredPolls.filter(p => p.status === 'closed');
  }

  return (
    <div className="dashboard-section-placeholder">
      <div className="dashboard-section-header">
        <div>
            <h2 className="dashboard-section-title">Community Polls</h2>
            <p className="dashboard-section-subtitle">
                Participate in community polls and make your voice heard.
            </p>
        </div>
        <FormButton 
          onClick={() => {
            if(!currentUserId) { 
                alert("Please sign in to create a poll."); 
                return; 
            }
            setIsModalOpen(true)
          }}
          variant="primary" 
          className="create-petition-btn"
        >
          <Plus size={18} /> Create Poll
        </FormButton>
      </div>
      
      <div className="petition-filter-bar">
        <div className="filter-group">
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="review">Under Review</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-category">Category</label>
          <select id="filter-category" name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="all">All Categories</option>
            <option value="community">Community</option>
            <option value="environment">Environment</option>
            <option value="local_gov">Local Govt</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-location">Location</label>
          <select id="filter-location" name="location" value={filters.location} onChange={handleFilterChange}>
            <option value="all">All Locations</option>
            {allLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="petition-tabs">
        <button 
          className={`petition-tab ${view === 'all' ? 'active' : ''}`}
          onClick={() => setView('all')}
        >
          All Polls
        </button>
        <button 
          className={`petition-tab ${view === 'active' ? 'active' : ''}`}
          onClick={() => setView('active')}
        >
          Active
        </button>
        <button 
          className={`petition-tab ${view === 'voted' ? 'active' : ''}`}
          onClick={() => setView('voted')}
        >
          Polls I Voted On
        </button>
        <button 
          className={`petition-tab ${view === 'my_polls' ? 'active' : ''}`}
          onClick={() => setView('my_polls')}
        >
          My Polls
        </button>
        <button 
          className={`petition-tab ${view === 'closed' ? 'active' : ''}`}
          onClick={() => setView('closed')}
        >
          Closed
        </button>
      </div>

      <div className="poll-card-list">
        {pollsToDisplay.length > 0 ? (
          pollsToDisplay.map((poll) => {
            // FIX: Safe access to votedBy array
            const safeVotedBy = poll.votedBy || [];
            const userHasVoted = currentUserId && safeVotedBy.includes(currentUserId);
            const showResults = userHasVoted || poll.status === 'closed';
            const userVoteId = (poll.userVote && currentUserId) ? poll.userVote[currentUserId] : null;

            return (
                <div key={poll.id} className="poll-card">
                <div className="poll-card-header">
                    <h3 className="poll-card-question">{poll.question}</h3>
                    <span className={`status-badge status-badge-${poll.status}`}>
                        {poll.status === 'review' ? 'Under Review' : poll.status}
                    </span>
                </div>
                <div className="poll-card-meta">
                    <p className="poll-card-author">By: {poll.authorName}</p>
                    <span className="poll-card-meta-divider">|</span>
                    <p className="poll-card-location"><MapPin size={12} /> {poll.location}</p>
                </div>
                <p className="poll-card-description">{poll.description}</p>
                
                <div className="poll-card-body">
                    {poll.status === 'review' ? (
                         <div className="poll-review-msg" style={{padding:'1rem', background:'#fff7ed', color:'#9a3412', borderRadius:'0.375rem', fontSize:'0.9rem'}}>
                            <AlertCircle size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'5px'}}/>
                            This poll is currently under review by moderators.
                         </div>
                    ) : showResults ? (
                    <div className="poll-results">
                        <p className="poll-results-total">{poll.totalVotes.toLocaleString()} Total Votes</p>
                        {poll.options.map(option => {
                            const pct = poll.totalVotes > 0 ? (poll.results[option.id] / poll.totalVotes) * 100 : 0;
                            return (
                                <div key={option.id} className="poll-result-bar-wrapper">
                                <div className="poll-result-label">
                                    <span>{option.text}</span>
                                    <strong>{pct.toFixed(0)}%</strong>
                                </div>
                                <div className="poll-result-bar-bg">
                                    <div className="poll-result-bar-fg" style={{ width: `${pct}%` }}></div>
                                </div>
                                {userHasVoted && userVoteId === option.id && ( 
                                    <span className="poll-your-vote-badge"><Check size={12} /> Your Vote</span>
                                )}
                                </div>
                            );
                        })}
                    </div>
                    ) : (
                    <div className="poll-options">
                        {poll.options.map(option => (
                            <button 
                                key={option.id} 
                                className="poll-option-label"
                                style={{width: '100%', textAlign: 'left', background: 'none'}}
                                onClick={() => handleVote(poll.id, option.id, poll)}
                            >
                                <span className="poll-option-text">{option.text}</span>
                            </button>
                        ))}
                    </div>
                    )}
                </div>
                <div className="poll-card-footer">
                    <p style={{margin: 0, display:'flex', alignItems:'center', gap:'5px'}}>
                        <Clock size={12}/> Closes on: {poll.closesOn}
                    </p>
                    <button 
                        className="poll-report-button" 
                        onClick={() => handleReportPoll(poll.id)}
                    >
                    <AlertCircle size={14} /> Report
                    </button>
                </div>
                </div>
            );
          })
        ) : (
          <div className="no-results-placeholder">
            <BarChart2 size={48} />
            <p>No polls found with the current filters.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create a New Poll"
      >
        <CreatePollForm 
          user={user}
          onSave={handleSavePoll}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

    </div>
  );
};

export default PollsSection;