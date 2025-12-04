import React, { useState } from 'react';
import '../styles/Login.css';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({ ...loginInfo, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) return handleError('Email and Password are required');

    try {
      const url = "http://localhost:8080/auth/login";
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo)
      });
      const result = await response.json();
      const { success, message, token, name, role,id, error } = result; // ✅ role included

      if (success) {
        // ✅ Store login data
        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', name);
        localStorage.setItem('role', role); // 👈 Store role
        localStorage.setItem('id', id); // 👈 Store role

         const userObj = {
          name,
          role,
          id,
          token,
          isSuperAdmin: result.isSuperAdmin // must come from backend
        };
        localStorage.setItem("user", JSON.stringify(userObj));

        handleSuccess(message);

        // ✅ Redirect based on role
        setTimeout(() => {
          if (role === 'official') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } else if (error) {
        handleError(error);
      } else {
        handleError(message);
      }
    } catch (err) {
      handleError("Something went wrong!");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SECTION */}
      <div className="left-section">
        <h1 className="brand">Civix</h1>
        <p className="tagline">Digital Civix Engagement Platform</p>

        <div className="features">
          <p>Create And Sign Petitions</p>
          <p>Participate In Public Polls</p>
          <p>Track Official Responses</p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="right-section">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to continue exploring</p>

          <input
            onChange={handleChange}
            type="email"
            name="email"
            placeholder="Enter your email"
            value={loginInfo.email}
          />

          <input
            onChange={handleChange}
            type="password"
            name="password"
            placeholder="Enter your password"
            value={loginInfo.password}
          />

          <button type="submit">Login</button>

          <Link to="/forgotpassword" className="forgot-password">Forgot Password?</Link>

          <p className="signup-link">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Login;
