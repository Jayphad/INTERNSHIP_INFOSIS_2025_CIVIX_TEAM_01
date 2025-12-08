import React,{useEffect} from "react";
import { Bell,LogOut } from "../assets/icons";
import "../styles/Dashboard.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';
import {ToastContainer } from 'react-toastify';



const DashboardHeader = ({ user, heading, toggleSidebar }) => {
  const[loggedInUser,setLoggedInUser] = useState('');
    const navigate =useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

  
      useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
      }, []);
       const handleLogout = (e) => {
            localStorage.removeItem('token');
            localStorage.removeItem('loggedInUser');
            handleSuccess('Logged Out Successfully');
             setTimeout(() => {
              navigate('/');
      
             },1000);
          }
  return (
   
    <>
 <header className="dashboard-header">
      <button onClick={toggleSidebar} className="sidebar-toggle-btn" style={{display:"flex",alignItems:"center",gap:"15px", marginLeft:"30px"}}>
       <p className="menu-icon">
         ☰
       </p>
        <p style={{display:"inline", fontSize:"16px"}}>{heading}</p>
      </button>

      <div className="dashboard-header-right">
        {/* <Bell className="header-icon" /> */}
        <div className="header-user">
          <div className="header-avatar">{loggedInUser[0] || "G"}</div>
          <span>{loggedInUser || "Guest User"}</span>
          
        </div>
        <div>
     <button onClick={() => setShowLogoutModal(true)}>
        <LogOut />
      </button>

      <ToastContainer />
    </div>
    </div>
    </header>
    {showLogoutModal && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h3>Are you sure you want to logout?</h3>

      <div className="modal-actions">
        <button 
          className="yes-btn"
          onClick={() => {
            setShowLogoutModal(false);
            handleLogout();
          }}
        >
          Yes
        </button>

        <button 
          className="no-btn"
          onClick={() => setShowLogoutModal(false)}
        >
          No
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default DashboardHeader;
