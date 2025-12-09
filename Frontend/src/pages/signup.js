import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import '../styles/Signup.css';

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    role: 'citizen'
  });

  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo({ ...signupInfo, [name]: value });
  };

  // helper: get current position as Promise
const getCurrentPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ latitude: null, longitude: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        console.warn("Geolocation error / denied:", err);
        resolve({ latitude: null, longitude: null });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword,role } = signupInfo;
    

if (!name || !email || !password || !confirmPassword)
  return handleError('All fields are required!');

if (password.length < 6)
  return handleError('Password must be at least 6 characters long!');

if (password !== confirmPassword)
  return handleError('Passwords do not match!');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email))
  return handleError('Please enter a valid email address!');


    try {
      // try to get location (user may deny permission)
    const { latitude, longitude } = await getCurrentPosition();

        // optionally include role if you added it to signupInfo (e.g. signupInfo.role)
    const payload = { name, email, password, latitude, longitude , role };

      const response = await fetch("http://localhost:8080/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( payload)
      });

      const result = await response.json();
      const { success, message, error } = result;

      if (success) {
        handleSuccess(message);
        setOtpSent(true);
      } else if (error) {
        handleError(error);
      } else {
        handleError(message);
      }
    } catch (err) {
      handleError("Error sending OTP");
      console.error(err);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const { email, otp } = signupInfo;

    if (!otp) return handleError('Please enter OTP');

    try {
      const response = await fetch("http://localhost:8080/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const result = await response.json();
      const { success, message, error } = result;

      if (success) {
        handleSuccess(message);
        setTimeout(() => navigate('/login'), 1500);
      } else if (error) {
        handleError(error);
      } else {
        handleError(message);
      }
    } catch (err) {
      handleError("Error verifying OTP");
      console.error(err);
    }
  };

  return (
    <div className="signup-container">
      <div className="left-section">
        <h1 className="brand">Civix</h1>
        <p className="tagline">Digital Civic Engagement Platform</p>
        <div className="features">
          {/* <p>📚 Buy & Sell Books</p> */}
        </div>
      </div>

      <div className="right-section">
        <div className="signup-form">
          <h2>Signup</h2>
          <p className="subtitle">Create your account to get started</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (otpSent) handleVerifyOtp(e);
              else handleSendOtp(e);
            }}
          >
            <div>
              <label htmlFor="name">Name </label>
              <input
                onChange={handleChange}
                type="text"
                name="name"
                placeholder="Enter your name..."
                value={signupInfo.name}
                disabled={otpSent}
              />
             
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                onChange={handleChange}
                type="email"
                name="email"
                placeholder="Enter your email..."
                value={signupInfo.email}
                disabled={otpSent}
              />
            </div>
          <div>
            <label htmlFor="role">Select Role </label>
            <select id="role" name="role"
              value={signupInfo.role}
              onChange={handleChange}
              className="input-field" >
              <option value="">Select Role</option>
              <option value="citizen">Citizen</option>
              <option value="official">Official</option>
            </select>
            
          </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                onChange={handleChange}
                type="password"
                name="password"
                placeholder="Enter your password..."
                value={signupInfo.password}
                disabled={otpSent}
              />
            </div>
            <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  onChange={handleChange}
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password..."
                  value={signupInfo.confirmPassword}
                  disabled={otpSent}
                />
              </div>

            {otpSent && (
              <div>
                <label htmlFor="otp">OTP</label>
                <input
                  onChange={handleChange}
                  type="text"
                  name="otp"
                  placeholder="Enter OTP sent to your email"
                  value={signupInfo.otp}
                />
              </div>
            )}

            <button type="submit">
              {otpSent ? 'Verify OTP' : 'Send OTP'}
            </button>

            <p className="signup-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default Signup;
