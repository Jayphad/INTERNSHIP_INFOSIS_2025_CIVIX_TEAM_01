import React, {  useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';

import {ToastContainer } from 'react-toastify';

function Home() {
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
    <div>
      <h1>Wlc:{loggedInUser}</h1>
      <button onClick={handleLogout}>Logout</button>
      <ToastContainer />
    </div>
  );
}   

export default Home;