import React, { useState } from "react";
import "../styles/Forgotpassword.css";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import { useNavigate, Link } from "react-router-dom";



function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState("");

  // STEP 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return handleError("Please enter your registered email");

    try {
      const url = "http://localhost:8080/auth/forgotpassword";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      const { success, message, error } = result;

      if (success) {
        handleSuccess(message || "OTP sent successfully!");
        setOtpSent(true);
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

  // STEP 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
     if (!otp || !newPassword || !confirmPassword)
    return handleError("Please fill all fields");

    if (newPassword !== confirmPassword)
    return handleError("Passwords do not match");

    try {
      const url = "http://localhost:8080/auth/resetpassword";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const result = await response.json();
      const { success, message, error } = result;

      if (success) {
        handleSuccess(message || "Password reset successful!");
        setTimeout(() => navigate("/login"), 1500);
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
    <div className="forgot-container">
      {/* LEFT SECTION */}
      <div className="left-section">
        <h1 className="brand">Civix</h1>
        <p className="tagline">Civix Is Ready To Help You</p>
      </div>

      {/* RIGHT SECTION */}
      <div className="right-section">
        <form
          className="forgot-form"
          onSubmit={otpSent ? handleResetPassword : handleSendOtp}
        >
          <h2>{otpSent ? "Reset Password" : "Forgot Password?"}</h2>
          <p className="subtitle">
            {otpSent
              ? "Enter the OTP sent to your email and set a new password."
              : "Enter your registered email to receive an OTP."}
          </p>

          {/* STEP 1: Enter Email */}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent} // disable after OTP is sent
          />

          {/* STEP 2: Show OTP + New Password fields */}
          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
                    <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
             />

            </>
          )}

          <button type="submit">
            {otpSent ? "Reset Password" : "Send OTP"}
          </button>

          <p className="back-login">
            Remember your password? <Link to="/login">Back to Login</Link>
          </p>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default ForgotPassword;
