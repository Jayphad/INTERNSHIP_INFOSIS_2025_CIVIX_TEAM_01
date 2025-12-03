// const HelpSection = () => {
//   return <div className="dashboard-section-placeholder"><h3>Help</h3><p>
// Welcome to the Help Section! Here you can find answers to frequently asked questions and get assistance with using the Civix platform.
// <br/><br/>
// **Getting Started**<br/><br/>
// - How do I create an account?<br/><br/>
// - How do I start a petition or poll?<br/><br/>
// - How do I navigate the dashboard?  <br/><br/>
// **Using Features**<br/><br/>
// - How to create and manage petitions?<br/><br/>
// - How to participate in polls?<br/><br/>
// - How to report issues or provide feedback?  <br/><br/>
// **Account Management**<br/><br/>
// - How to update my profile information?<br/><br/>
// - How to change my password?<br/><br/>
// - How to manage notification settings?<br/><br/>
// If you need further assistance, please contact our support team at support@civixplatform.com.<br/><br/>
// </p></div>;
// };
// export default HelpSection;


import React, { useState } from "react";
import { HelpCircle, Plus, X } from "../../assets/icons";
import "../../styles/Dashboard.css";
import "../../styles/Help.css";

/* --------------------------------------
   FAQ DATA STRUCTURE
-------------------------------------- */
const faqData = [
  {
    category: "Getting Started",
    items: [
      {
        question: "How do I create an account?",
        answer: (
          <div>
            <p>Creating an account is simple. Follow these steps:</p>
            <ol style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
              <li>
                Click on the <strong>Sign Up</strong> link on the login page.
              </li>
              <li>
                Fill in your <strong>Full Name</strong>, <strong>Email Address</strong>, and
                create a secure <strong>Password</strong>.
              </li>
              <li>Click the <strong>Sign Up</strong> button to proceed.</li>
              <li>Check your email for a <strong>6-digit verification code (OTP)</strong>.</li>
              <li>
                Enter the code on the verification screen to confirm your identity and activate
                your account.
              </li>
            </ol>
          </div>
        )
      },
      {
        question: "How do I start a petition or poll?",
        answer: (
          <div>
            <p>To launch a new initiative, follow these instructions:</p>
            <ol style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
              <li>Log in to your dashboard.</li>
              <li>
                Navigate to the <strong>Petitions</strong> or <strong>Polls</strong> section.
              </li>
              <li>
                Click the blue <strong>Create</strong> button in the top right corner.
              </li>
              <li>
                Fill out the required details — <strong>Title</strong>,{" "}
                <strong>Description</strong>, <strong>Category</strong>.
              </li>
              <li>Click <strong>Publish</strong> to make it live.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How do I navigate the dashboard?",
        answer: (
          <div>
            <p>Getting around CIVIX is easy:</p>
            <ol style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
              <li>
                Use the <strong>Sidebar</strong> to access Dashboard, Petitions, Polls, Reports,
                Community.
              </li>
              <li>
                Click <strong>Dashboard</strong> for an overview of your activity & stats.
              </li>
              <li>
                Use <strong>Search</strong> or filters to find specific content.
              </li>
              <li>
                Access <strong>Profile</strong> and <strong>Settings</strong> from the sidebar
                bottom.
              </li>
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
            <ol style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
              <li>Go to the <strong>Petitions</strong> page.</li>
              <li>Click <strong>Create Petition</strong>.</li>
              <li>View created petitions under <strong>My Petitions</strong>.</li>
              <li>Edit/Delete while active.</li>
              <li>Closed petitions cannot be edited.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How to participate in polls?",
        answer: (
          <div>
            <p>Make your voice heard by voting:</p>
            <ol style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
              <li>Visit the <strong>Polls</strong> page.</li>
              <li>Open any poll to view question & options.</li>
              <li>Select an option and click <strong>Vote</strong>.</li>
              <li>You can vote only <strong>once</strong> per poll.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How to report issues or provide feedback?",
        answer: (
          <div>
            <p>Help us improve your community and the platform:</p>
            <ol style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
              <li>
                For community issues → go to <strong>Reports</strong> →{" "}
                <strong>Create Report</strong>.
              </li>
              <li>
                To give platform feedback → open the <strong>Feedback</strong> page.
              </li>
              <li>Fill the form with details.</li>
              <li>Upload screenshots if helpful.</li>
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
            <ol style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
              <li>Go to <strong>Settings</strong>.</li>
              <li>Select <strong>My Profile</strong>.</li>
              <li>Click <strong>Edit Profile</strong>.</li>
              <li>Update name, phone, address.</li>
              <li>Upload new profile picture if needed.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How to change my password?",
        answer: (
          <div>
            <p>Secure your account with a new password:</p>
            <ol style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
              <li>Open <strong>Settings</strong>.</li>
              <li>Choose <strong>Change Password</strong>.</li>
              <li>Enter new password twice.</li>
              <li>Click <strong>Update Password</strong>.</li>
            </ol>
          </div>
        )
      },
      {
        question: "How to manage notification settings?",
        answer: (
          <div>
            <p>Control alerts you receive:</p>
            <ol style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
              <li>Currently notifications are limited.</li>
              <li>More controls coming soon.</li>
              <li>They will appear in a new “Notifications” section.</li>
            </ol>
          </div>
        )
      }
    ]
  }
];

/* --------------------------------------
   ACCORDION ITEM
-------------------------------------- */
const AccordionItem = ({ item, isOpen, onClick }) => (
  <div className={`help-accordion-item ${isOpen ? "open" : ""}`}>
    <button className="help-accordion-header" onClick={onClick}>
      <span className="help-question">{item.question}</span>
      <span className="help-icon">
        {isOpen ? <X size={20} /> : <Plus size={20} />}
      </span>
    </button>

    <div
      className="help-accordion-body"
      style={{
        maxHeight: isOpen ? "1000px" : "0",
        opacity: isOpen ? 1 : 0,
        height: isOpen ? "auto" : "0",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out"
      }}
    >
      <div className="help-answer">{item.answer}</div>
    </div>
  </div>
);

/* --------------------------------------
   HELP SECTION
-------------------------------------- */
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

        {/* CONTACT BOX */}
        <div className="help-contact-box">
          <div className="help-contact-icon">
            <HelpCircle size={32} />
          </div>

          <div className="help-contact-text">
            <h4>Still need help?</h4>
            <p>If you need further assistance, please contact our support team.</p>
            <a href="mailto:support@civixplatform.com" className="help-email-link">
              support@civixplatform.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;
