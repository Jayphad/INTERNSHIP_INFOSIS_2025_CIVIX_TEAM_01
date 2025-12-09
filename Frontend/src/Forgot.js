import React, { useState } from "react";
import "./Forgot.css";
import { Link } from "react-router-dom";


export default function Forgot() {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    alert("Reset link sent to: " + email);
  }

  return (
    <div className="page">
      <div className="page-inner">

        {/* LEFT HERO */}
        <div className="hero">
          <h1 className="hero-title">No Worries...!!</h1>

          <div className="subtitle-row">
            <div className="subtitle-box">Civix Is Ready To Help You</div>

            {/* dotted connector stretches between left and right fixed widths */}
            <div className="connector" />
          </div>
        </div>

        {/* RIGHT FORM (fixed width) */}
        <div className="card-wrapper">
          <div className="card">
            {/* top-left glow */}
            <div className="glow top-left" />
            {/* bottom-right glow */}
            <div className="glow bottom-right" />

            <h2 className="card-title">Forgot Password ?</h2>
            <p className="card-sub">Please enter your email</p>

            <form className="reset-form" onSubmit={handleSubmit}>
              
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="btn" type="submit">Reset Password</button>
            </form>
            <div className="space">OR</div>
            <div className="card-footer">Create new account</div>

            <div className="Back"><Link to="/" classname="Back-link">Back to login</Link></div>
          </div>
        </div>

      </div>
    </div>
  );
}

