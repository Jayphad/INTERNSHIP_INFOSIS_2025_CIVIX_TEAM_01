import React, { useState } from 'react';
import { HelpCircle, Plus, X } from '../../assets/icons'; // Reusing icons for accordion
import '../../styles/Dashboard.css';
import '../../styles/Help.css';

// FAQ Data Structure
const faqData = [
  {
    category: "Getting Started",
    items: [
      {
        question: "How do I create an account?",
        answer: (
          <div>
            <p>Creating an account is simple. Follow these steps:</p>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li>Click on the <strong>Sign Up</strong> link on the login page.</li>
              <li>Fill in your <strong>Full Name</strong>, <strong>Email Address</strong>, and create a secure <strong>Password</strong>.</li>
              <li>Click the <strong>Sign Up</strong> button to proceed.</li>
              <li>Check your email for a <strong>6-digit verification code (OTP)</strong>.</li>
              <li>Enter the code on the verification screen to confirm your identity and activate your account.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How do I start a petition or poll?",
        answer: (
          <div>
            <p>To launch a new initiative, follow these instructions:</p>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li>Log in to your dashboard.</li>
              <li>Navigate to either the <strong>Petitions</strong> or <strong>Polls</strong> section using the sidebar menu.</li>
              <li>Click the blue <strong>Create</strong> button located in the top right corner.</li>
              <li>Fill out the required details, such as the <strong>Title</strong>, <strong>Description</strong>, and <strong>Category</strong>.</li>
              <li>Review your information and click <strong>Publish</strong> to make it live.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How do I navigate the dashboard?",
        answer: (
          <div>
            <p>Getting around CIVIX is easy:</p>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li>Use the <strong>Sidebar</strong> on the left to access main sections like Dashboard, Petitions, Polls, Reports, and Community.</li>
              <li>Click on <strong>Dashboard</strong> to see an overview of your activity and community stats.</li>
              <li>Use the <strong>Search Bar</strong> (if available) or filters within each section to find specific content.</li>
              <li>Access your <strong>Profile</strong> and <strong>Settings</strong> from the links at the bottom of the sidebar.</li>
            </ol>
          </div>
        )
      }
    ]
  },
  {
    category: "Using Features",
    items: [
      {
        question: "How to create and manage petitions?",
        answer: (
          <div>
            <p>Manage your civic campaigns effectively:</p>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li>Go to the <strong>Petitions</strong> page from the sidebar.</li>
              <li>Click <strong>Create Petition</strong> to start a new one.</li>
              <li>To view petitions you've created, click the <strong>My Petitions</strong> tab.</li>
              <li>You can <strong>Edit</strong> or <strong>Delete</strong> your petition using the buttons on the petition card, provided it is still active.</li>
              <li>Once a petition is closed, it can no longer be edited.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How to participate in polls?",
        answer: (
          <div>
            <p>Make your voice heard by voting:</p>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li>Visit the <strong>Polls</strong> page to see a list of active polls in your community.</li>
              <li>Click on a poll card to view the question and available options.</li>
              <li>Select your preferred option and click <strong>Vote</strong>.</li>
              <li>Note: You can only vote <strong>once</strong> per poll. Results are displayed immediately after you cast your vote.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How to report issues or provide feedback?",
        answer: (
          <div>
            <p>Help us improve your community and the platform:</p>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li>To report community issues (like potholes or graffiti), navigate to the <strong>Reports</strong> page and click <strong>Create Report</strong>.</li>
              <li>To give feedback on the CIVIX platform itself, click the <strong>Feedback</strong> link in the sidebar.</li>
              <li>Fill out the form with your comments or bug report.</li>
              <li>You can also upload screenshots to help explain your issue.</li>
            </ol>
          </div>
        )
      }
    ]
  },
  {
    category: "Account Management",
    items: [
      {
        question: "How to update my profile information?",
        answer: (
          <div>
            <p>Keep your profile up to date:</p>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li>Click on <strong>Settings</strong> in the sidebar.</li>
              <li>Select the <strong>My Profile</strong> option.</li>
              <li>Click the <strong>Edit Profile</strong> button.</li>
              <li>Update your name, phone number, or address as needed.</li>
              <li>You can also upload a new profile picture by clicking the camera icon on your avatar.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How to change my password?",
        answer: (
          <div>
            <p>Secure your account with a new password:</p>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li>Go to the <strong>Settings</strong> page.</li>
              <li>Click on the <strong>Change Password</strong> card.</li>
              <li>Enter your new password in the provided field.</li>
              <li>Re-enter the password to confirm it.</li>
              <li>Click <strong>Update Password</strong> to save your changes.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How to manage notification settings?",
        answer: (
          <div>
            <p>Control what alerts you receive:</p>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li>Currently, notifications are sent for critical updates only.</li>
              <li>Granular notification controls will be available in a future update.</li>
              <li>Once available, you will find them under the <strong>Settings</strong> page in a dedicated "Notifications" section.</li>
            </ol>
          </div>
        )
      }
    ]
  }
];

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div className={`help-accordion-item ${isOpen ? 'open' : ''}`}>
      <button className="help-accordion-header" onClick={onClick}>
        <span className="help-question">{item.question}</span>
        <span className="help-icon">
          {isOpen ? <X size={20} /> : <Plus size={20} />} {/* Reusing X/Plus as Minus/Plus */}
        </span>
      </button>
      <div 
        className="help-accordion-body" 
        style={{ 
          maxHeight: isOpen ? '1000px' : '0',
          opacity: isOpen ? 1 : 0,
          // Override possible CSS height:0 issues
          height: isOpen ? 'auto' : '0',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <div className="help-answer">
          {item.answer}
        </div>
      </div>
    </div>
  );
};

const HelpSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="dashboard-section-placeholder">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">Help & Support</h2>
      </div>
      <p className="dashboard-section-subtitle">
        Find answers to common questions and learn how to get the most out of CIVIX.
      </p>

      <div className="help-container">
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="help-category-group">
            <h3 className="help-category-title">{section.category}</h3>
            <div className="help-accordion">
              {section.items.map((item, itemIndex) => {
                // Create a unique ID for each question across all sections
                const uniqueId = `${sectionIndex}-${itemIndex}`;
                return (
                  <AccordionItem 
                    key={uniqueId}
                    item={item}
                    isOpen={openIndex === uniqueId}
                    onClick={() => handleToggle(uniqueId)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div className="help-contact-box">
          <div className="help-contact-icon">
            <HelpCircle size={32} />
          </div>
          <div className="help-contact-text">
            <h4>Still need help?</h4>
            <p>If you need further assistance, please contact our support team.</p>
            <a href="mailto:support@civixplatform.com" className="help-email-link">support@civixplatform.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;