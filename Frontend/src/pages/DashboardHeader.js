import React,{useEffect} from "react";
import { Bell } from "../assets/icons";
import "../styles/Dashboard.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';
import {ToastContainer } from 'react-toastify';


const DashboardHeader = ({ user, heading, toggleSidebar }) => {
  const[loggedInUser,setLoggedInUser] = useState('');
    const navigate =useNavigate();
  
      useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
      }, []);
       const handleLogout = (e) => {
            localStorage.removeItem('token');
            localStorage.removeItem('loggedInUser');
            handleSuccess('Logged Out Successfully');
             setTimeout(() => {
              navigate('/login');
      
             },1000);
          }
  return (
    <header className="dashboard-header">
      <button onClick={toggleSidebar} className="sidebar-toggle-btn" style={{display:"flex",alignItems:"center",gap:"15px", marginLeft:"30px"}}>
        ☰
        <p style={{display:"inline", fontSize:"16px"}}>{heading}</p>
      </button>

      <div className="dashboard-header-right">
        <Bell className="header-icon" />
        <div className="header-user">
          <div className="header-avatar">{loggedInUser[0] || "G"}</div>
          <span>{loggedInUser || "Guest User"}</span>
          
        </div>
        <div>
      <button onClick={handleLogout}>Logout</button>
      <ToastContainer />
    </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
