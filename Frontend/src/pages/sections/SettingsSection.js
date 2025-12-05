import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Added import for navigation
import { User, Lock, Info, LogOut, Camera, Mail, MapPin, Phone, Edit2, X } from '../../assets/icons';
import { FormButton, FormInput } from '../FormControls';
import Modal from './Modal';
import '../../styles/Dashboard.css';
import '../../styles/Settings.css'; 
import { ToastContainer, toast } from 'react-toastify'; // 2. Added 'toast' import

// --- SUB-COMPONENTS FOR MODALS ---

const ProfileModal = ({ onClose }) => {
  const user=JSON.parse(localStorage.getItem("user")) ;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "Your Name");

  const handleSave = async () => {
    if (!name) return toast.error("Name cannot be empty");
    
    try {
      const userId =localStorage.getItem("id");
      if (!userId) return toast.error("User ID not found.");

      const response = await fetch("http://localhost:8080/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, name }) // send only updated name
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Profile updated successfully!");
        const updatedUser = { ...user, name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        onClose && onClose(updatedUser);
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error — could not update profile.");
    }
    setIsEditing(false);
  };

  return (
    <div className="profile-modal-content">
      <div className="profile-header">
        {/* Avatar */}
        <div className="profile-avatar-large">
          <div className="avatar-placeholder">{name.charAt(0).toUpperCase()}</div>
        </div>

        {/* Role and Name */}
        <div className="profile-title">
          <p className="profile-role">{user?.role === "official" ? "Official" : "Citizen"}</p>
          {!isEditing ? (
            <h3>{name}</h3>
          ) : (
            <input
              className="profile-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </div>

        {!isEditing && (
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
            <Edit2 size={16} /> Edit Name
          </button>
        )}
      </div>

      {/* Email */}
      <div className="profile-details-view">
        <div className="detail-row">
          <Mail size={18} />
          <div>
            <span className="detail-label">Email</span>
            <p className="detail-value">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="form-action-buttons">
          <FormButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </FormButton>
          <FormButton type="button" variant="primary" onClick={handleSave}>
            Save Changes
          </FormButton>
        </div>
      )}
    </div>
  );
};


const AboutModal = () => (
  <div className="about-modal-content">
    <div className="about-logo-section">
      <h2 className="about-app-name">Civix</h2>
      <span className="about-version">Version 1.0.0 (Beta)</span>
    </div>
    <div className="about-body">
      <p>
        <strong>Civix</strong> is a community engagement platform designed to bridge the gap between citizens and local government.
      </p>
      <p>
        Our mission is to empower individuals to have a voice in their community through petitions, polls, and direct reporting of local issues.
      </p>
      <div className="about-links">
        <a href="#">Terms of Service</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Open Source License</a>
      </div>
      <p className="about-footer">
        © {new Date().getFullYear()} Civix Platform. All rights reserved.
      </p>
    </div>
  </div>
);

// --- MAIN SETTINGS COMPONENT ---

const SettingsSection = ({ user, onLogOut }) => {
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate(); // 3. Initialize hook
  
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const handleChangePassword = async (e) => {
  e.preventDefault();

  if (!newPass || !confirmPass) {
    toast.error("Please fill all fields");
    return;
  }

  if (newPass !== confirmPass) {
    toast.error("Passwords do not match");
    return;
  }

  try {
    // Get user id directly from localStorage
    const userId = localStorage.getItem("id");
    if (!userId) {
      toast.error("User id not found. Please login again.");
      return;
    }

    const payload = { id: userId, newPassword: newPass };
    console.log("→ sending updatepassword request:", payload);

    const response = await fetch("http://localhost:8080/auth/updatepassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("← HTTP status:", response.status, response.statusText);

    let result = null;
    try {
      result = await response.json();
      console.log("← response json:", result);
    } catch (jsonErr) {
      console.warn("Could not parse JSON response:", jsonErr);
    }

    if (!response.ok) {
      const msg = (result && (result.message || result.error)) || `Server returned ${response.status}`;
      toast.error(msg);
      return;
    }

    // Success
    if (result?.success) {
      toast.success(result.message || "Password changed successfully!");
      setActiveModal(null);
      setNewPass("");
      setConfirmPass("");
    } else {
      toast.error(result?.message || "Failed to update password");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    toast.error("Network error — could not reach server. Check console.");
  }
};


  const handleLogout = (e) => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    toast.success('Logged Out Successfully'); // 4. Fixed function call
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  }

  return (
    <div className="dashboard-section-placeholder">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">Settings</h2>
      </div>
      <p className="dashboard-section-subtitle">Manage your account and preferences.</p>

      {/* START of Settings List */}
      <div className="settings-list">
        
        {/* My Profile */}
        <div className="settings-item" onClick={() => setActiveModal('profile')}>
          <div className="settings-icon-wrapper icon-blue">
            <User size={24} />
          </div>
          <div className="settings-info">
            <h3>My Profile</h3>
            <p>View and edit your personal information</p>
          </div>
        </div>

        {/* Change Password */}
        <div className="settings-item" onClick={() => setActiveModal('password')}>
          <div className="settings-icon-wrapper icon-green">
            <Lock size={24} />
          </div>
          <div className="settings-info">
            <h3>Change Password</h3>
            <p>Update your password for security</p>
          </div>
        </div>

        {/* About Civix */}
        <div className="settings-item" onClick={() => setActiveModal('about')}>
          <div className="settings-icon-wrapper icon-purple">
            <Info size={24} />
          </div>
          <div className="settings-info">
            <h3>About Civix</h3>
            <p>Learn more about our mission and version</p>
          </div>
        </div>

        {/* Logout */}
        <div className="settings-item settings-logout" onClick={handleLogout}>
          <div className="settings-icon-wrapper icon-red" >
            <LogOut size={24} />
          </div>
          <div className="settings-info">
            <h3>Log Out</h3>
            <p>Sign out of your account securely</p>
          </div>
        </div>

      </div> 
      {/* 5. THIS WAS MISSING: Closing div for settings-list */}

      {/* Toast moved outside the logout button to prevent nesting issues */}
      <ToastContainer />

      {/* --- MODALS --- */}
      
      {/* Profile Modal */}
<Modal 
  isOpen={activeModal === 'profile'} 
  onClose={() => setActiveModal(null)}
  title="My Profile"
>
  <ProfileModal 
   
    onClose={(updatedUser) => {
      setActiveModal(null);
      // Optional: update parent state to reflect changes in dashboard
      // setUser(updatedUser);
    }} 
  />
</Modal>



      {/* Change Password Modal */}
    <Modal 
  isOpen={activeModal === 'password'} 
  onClose={() => setActiveModal(null)}
  title="Change Password"
>
  <form onSubmit={handleChangePassword} className="petition-create-form petition-modal-form">
    <FormInput 
      id="new-pass"
      type="password"
      label="New Password"
      placeholder="Enter new password"
      value={newPass}
      onChange={(e)=>setNewPass(e.target.value)}
    />

    <FormInput 
      id="conf-pass"
      type="password"
      label="Confirm New Password"
      placeholder="Re-enter new password"
      value={confirmPass}
      onChange={(e)=>setConfirmPass(e.target.value)}
/>

     <div className="form-action-buttons">
        <FormButton type="button" variant="secondary" onClick={() => setActiveModal(null)}>Cancel</FormButton>
        <FormButton type="submit" variant="primary">Update Password</FormButton>
     </div>
  </form>
</Modal>

      {/* About Modal */}
      <Modal 
        isOpen={activeModal === 'about'} 
        onClose={() => setActiveModal(null)}
        title="About"
      >
        <AboutModal />
      </Modal>

    </div>
  );
};

export default SettingsSection;