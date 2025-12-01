import React, { useState } from 'react';
import { User, Lock, Info, LogOut, Camera, Mail, MapPin, Phone, Edit2, X } from '../../assets/icons';
import { FormButton, FormInput } from '../FormControls';
import Modal from './Modal';
import '../../styles/Dashboard.css';
import '../../styles/Settings.css'; // We'll create this next

// --- SUB-COMPONENTS FOR MODALS ---

const ProfileModal = ({ user, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
     name: (user && user.name) || "Your Name",
  email: (user && user.email) || "youremail@example.com",
    phone: "+91 xxxxx xxxxx",
    address: "123, Main Street, City, Country",
    avatar: null
  });

  const handleSave = (e) => {
    e.preventDefault();
    // In a real app, API call here
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, avatar: URL.createObjectURL(file) });
    }
  };

  const removeAvatar = () => {
    setProfileData({ ...profileData, avatar: null });
  };

  return (
    <div className="profile-modal-content">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {profileData.avatar ? (
            <img src={profileData.avatar} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">{profileData.name.charAt(0)}</div>
          )}
          {isEditing && (
            <div className="avatar-overlay">
               <label htmlFor="avatar-upload" className="avatar-upload-btn">
                 <Camera size={20} />
               </label>
               <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} hidden />
               {profileData.avatar && (
                 <button className="avatar-remove-btn" onClick={removeAvatar} title="Remove photo">
                   <X size={16} />
                 </button>
               )}
            </div>
          )}
        </div>
        <div className="profile-title">
          <h3>{profileData.name}</h3>
          <p>Citizen / Resident</p>
        </div>
        {!isEditing && (
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
            <Edit2 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="profile-form">
          <FormInput 
            label="Full Name" 
            value={profileData.name} 
            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
          />
          <FormInput 
            label="Email" 
            value={profileData.email} 
            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
          />
          <FormInput 
            label="Phone Number" 
            value={profileData.phone} 
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
          />
          <div className="form-field-group">
             <label>Address</label>
             <textarea 
                className="form-input" 
                rows="3"
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
             />
          </div>
          <div className="form-action-buttons">
            <FormButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</FormButton>
            <FormButton type="submit" variant="primary">Save Changes</FormButton>
          </div>
        </form>
      ) : (
        <div className="profile-details-view">
          <div className="detail-row">
            <Mail size={18} />
            <div>
              <span className="detail-label">Email</span>
              <p className="detail-value">{profileData.email}</p>
            </div>
          </div>
          <div className="detail-row">
            <Phone size={18} />
            <div>
              <span className="detail-label">Phone</span>
              <p className="detail-value">{profileData.phone}</p>
            </div>
          </div>
          <div className="detail-row">
            <MapPin size={18} />
            <div>
              <span className="detail-label">Address</span>
              <p className="detail-value">{profileData.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AboutModal = () => (
  <div className="about-modal-content">
    <div className="about-logo-section">
      {/* You can import the logo image here if you want */}
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

const SettingsSection = ({ user, onSignOut }) => {
  // 'profile', 'password', 'about', or null
  const [activeModal, setActiveModal] = useState(null);
  
  // Re-using the NewPassword component from auth but wrapping it for modal use
  // We need to import it specifically or just recreate a simple form here for simplicity inside the dashboard context
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const handleChangePassword = (e) => {
    e.preventDefault();
    if(newPass !== confirmPass) { alert("Passwords do not match"); return; }
    alert("Password updated successfully!");
    setActiveModal(null);
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="dashboard-section-placeholder">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">Settings</h2>
      </div>
      <p className="dashboard-section-subtitle">Manage your account and preferences.</p>

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
        <div className="settings-item settings-logout" onClick={onSignOut}>
          <div className="settings-icon-wrapper icon-red">
            <LogOut size={24} />
          </div>
          <div className="settings-info">
            <h3>Log Out</h3>
            <p>Sign out of your account securely</p>
          </div>
        </div>

      </div>

      {/* --- MODALS --- */}
      
      {/* Profile Modal */}
      <Modal 
        isOpen={activeModal === 'profile'} 
        onClose={() => setActiveModal(null)}
        title="My Profile"
      >
        <ProfileModal user={user} onClose={() => setActiveModal(null)} />
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
              value={newPass} 
              onChange={(e)=>setNewPass(e.target.value)} 
           />
           <FormInput 
              id="conf-pass" 
              type="password" 
              label="Confirm Password" 
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