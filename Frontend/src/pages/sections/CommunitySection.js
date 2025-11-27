import React, { useState } from 'react';
import { FormButton } from '../FormControls';
import { Users, MessageSquare, Calendar, Plus, MapPin } from '../../assets/icons';
import '../../styles/Community.css';
import Modal from './Modal'; // Re-use your Modal component
import '../../styles/Modal.css';

// --- Mock Data ---
const mockDiscussions = [
  {
    id: 1,
    author: "Sarah Jenkins",
    avatar: "SJ",
    time: "2 hours ago",
    title: "Volunteers needed for park cleanup this Saturday!",
    content: "Hi everyone! We're organizing a cleanup at Central Park this weekend. We have bags and gloves, just bring yourself and some water. Meeting at the north gate at 9 AM.",
    likes: 12,
    comments: 4,
    category: "Events"
  },
  {
    id: 2,
    author: "Mike Ross",
    avatar: "MR",
    time: "5 hours ago",
    title: "Thoughts on the new bike lane proposal?",
    content: "I've been reading through the city's proposal for the new bike lanes on Main St. While I support it, I'm concerned about the reduction in parking spots for local businesses. What do you all think?",
    likes: 8,
    comments: 15,
    category: "Policy"
  },
  {
    id: 3,
    author: "Elena Rodriguez",
    avatar: "ER",
    time: "1 day ago",
    title: "Local Farmer's Market - Vendor List",
    content: "Does anyone have a list of vendors for this week's market? I'm looking for that specific honey stand that was there last month.",
    likes: 5,
    comments: 2,
    category: "General"
  }
];

const mockEvents = [
  {
    id: 1,
    title: "Town Hall Meeting",
    date: "Nov 15, 6:00 PM",
    location: "City Hall, Room 204",
    attendees: 45
  },
  {
    id: 2,
    title: "Community Garden Workshop",
    date: "Nov 18, 10:00 AM",
    location: "Northside Community Garden",
    attendees: 12
  }
];

// --- Components ---

const DiscussionCard = ({ discussion }) => (
  <div className="discussion-card">
    <div className="discussion-header">
      <div className="discussion-author-info">
        <div className="author-avatar">{discussion.avatar}</div>
        <div>
          <h4 className="author-name">{discussion.author}</h4>
          <span className="post-time">{discussion.time} • {discussion.category}</span>
        </div>
      </div>
    </div>
    <div className="discussion-content">
      <h3 className="discussion-title">{discussion.title}</h3>
      <p className="discussion-text">{discussion.content}</p>
    </div>
    <div className="discussion-footer">
      <button className="discussion-action-btn">
        <span className="heart-icon">♥</span> {discussion.likes} Likes
      </button>
      <button className="discussion-action-btn">
        <MessageSquare size={16} /> {discussion.comments} Comments
      </button>
    </div>
  </div>
);

const EventCard = ({ event }) => (
  <div className="event-card">
    <div className="event-date-badge">
      <Calendar size={20} />
    </div>
    <div className="event-details">
      <h4 className="event-title">{event.title}</h4>
      <p className="event-time">{event.date}</p>
      <p className="event-location"><MapPin size={14} /> {event.location}</p>
    </div>
  </div>
);

const CreatePostForm = ({ onCancel, onPost }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate posting
        onPost({
            id: Math.random(),
            author: "Demo User",
            avatar: "DU",
            time: "Just now",
            title,
            content,
            likes: 0,
            comments: 0,
            category
        });
    };

    return (
        <form onSubmit={handleSubmit} className="petition-create-form petition-modal-form">
            <div className="form-field-group">
                <label>Title</label>
                <input 
                    type="text" 
                    placeholder="What's on your mind?" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                />
            </div>
            <div className="form-field-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>General</option>
                    <option>Events</option>
                    <option>Policy</option>
                    <option>Safety</option>
                </select>
            </div>
            <div className="form-field-group">
                <label>Content</label>
                <textarea 
                    rows="4" 
                    placeholder="Share details..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
            </div>
            <div className="form-action-buttons">
                <FormButton type="button" variant="secondary" onClick={onCancel}>Cancel</FormButton>
                <FormButton type="submit" variant="primary">Post</FormButton>
            </div>
        </form>
    );
}

const CommunitySection = () => {
  const [discussions, setDiscussions] = useState(mockDiscussions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePost = (newPost) => {
      setDiscussions([newPost, ...discussions]);
      setIsModalOpen(false);
  };

  return (
    <div className="dashboard-section-placeholder">
      <div className="reports-section-header">
        <div>
          <h2 className="reports-section-title">Community</h2>
          <p className="reports-section-subtitle">Connect with neighbors, join discussions, and find local events.</p>
        </div>
        <div>
          <FormButton 
              variant="primary" 
              className="create-petition-btn"
              onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} /> New Post
          </FormButton>
        </div>
      </div>

      <div className="community-layout">
        {/* Main Feed */}
        <div className="community-feed">
          <h3 className="section-heading">Recent Discussions</h3>
          <div className="discussions-list">
            {discussions.map(discussion => (
              <DiscussionCard key={discussion.id} discussion={discussion} />
            ))}
          </div>
        </div>

        {/* Sidebar: Events & Groups */}
        <div className="community-sidebar">
          <div className="sidebar-widget">
            <h3 className="widget-heading">Upcoming Events</h3>
            <div className="events-list">
              {mockEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <button className="view-all-link">View Calendar →</button>
          </div>

          <div className="sidebar-widget">
            <h3 className="widget-heading">Active Groups</h3>
            <ul className="groups-list">
               <li>
                  <span className="group-icon">🌱</span>
                  <div className="group-info">
                     <strong>Green City Initiative</strong>
                     <span>245 members</span>
                  </div>
               </li>
               <li>
                  <span className="group-icon">🚴</span>
                  <div className="group-info">
                     <strong>Cyclists of San Diego</strong>
                     <span>128 members</span>
                  </div>
               </li>
               <li>
                  <span className="group-icon">📚</span>
                  <div className="group-info">
                     <strong>Local Book Club</strong>
                     <span>56 members</span>
                  </div>
               </li>
            </ul>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create a New Post"
      >
          <CreatePostForm onCancel={() => setIsModalOpen(false)} onPost={handlePost} />
      </Modal>

    </div>
  );
};

export default CommunitySection;