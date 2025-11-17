import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Username: ${username}\nPassword: ${password}\nRemember me: ${remember}`);
  };

  return (
    <div className="login-container">
      
      <div className="login-left">
        <h1>Civix</h1>
        <div className="sub-row">
          <div className="subtitle">Digital Civic Engagement Platform</div>
          {/*Dotted-line */}
           <div className="dotted-line"></div>
        </div>
        <ul className="features">
          <li>Create And Sign Petitions</li>
          <li>Participate in Public Polls</li>
          <li>Track Official Response</li>
        </ul>
      </div>

      <div className="login-right">
        <div className="login-box">
            {/* Glowing circles */}
          <div className="circle top-left"></div>
          <div className="circle bottom-right"></div>
          <h2>Welcome To Civix</h2>
          <form onSubmit={handleLogin}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <div className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </div>
            <button type="submit">Login</button>
            <p className="forgot"> 
              <Link to="/forgot" className="forgot-link">
                Forgot password?
              </Link>
            </p>
            <p class="signup-text">Don’t have an account? <span class="signup-highlight">Sign up</span></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
