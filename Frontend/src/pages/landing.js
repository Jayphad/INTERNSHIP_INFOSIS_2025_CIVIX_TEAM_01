import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";
import { FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const images = [
  "https://www.gosurvey.in/media/ncmp2uwo/offline-surveys-in-political-campaigns.png",
  "https://www.agilitypr.com/wp-content/uploads/2020/11/polls-1.jpg",
  "https://media.licdn.com/dms/image/v2/D5622AQH0jKyatYOPvQ/feedshare-shrink_800/B56ZgO8oj9HQAg-/0/1752597433932?e=2147483647&v=beta&t=dD_7vKEvQ6V9LMQDGjrwp8L5fP3ESX9tizDFoNQKhPk",
  "https://cdn.dnaindia.com/sites/default/files/styles/full/public/2018/12/26/769943-potholes-122618.jpg",
];


const LandingPage = () => {
  const [current, setCurrent] = useState(0);
   const navigate = useNavigate();

   const [feedback, setFeedbackList] = useState([]);

useEffect(() => {
  const fetchFeedback = async () => {
    try {
      const res = await fetch("http://localhost:8080/feedback/all");
      const data = await res.json();

      if (data.success && Array.isArray(data.feedbacks)) {
        const sortedFeedback = data.feedbacks.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setFeedbackList(sortedFeedback);        // full
        // setFeedbackCount(sortedFeedback.length); // count only
      } else {
        console.warn("Unexpected feedback response:", data);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  fetchFeedback();
}, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Slider */}
      <div className="slider">
        <div className="slider-nav">
               {localStorage.getItem("token") ? (
                <a href="/dashboard" className="nav-link">Dashboard</a>
              ) : (
                <a href="/login" className="nav-link">Login</a>
              )}
              <a href="#services" className="nav-link">Services</a>
              <a href="#contact" className="nav-link">Contact</a>
        </div>


        <img src={images[current]} alt="Slider" className="slider-image" />
        <div className="slider-overlay">
          <h1>Digital Civic Management System</h1>
          <p>Empowering citizens through smart governance</p>
        </div>
      </div>

      {/* Welcome Section */}
      <section className="welcome">
        <h2>Welcome to Our Platform</h2>
        <p>
          Our system connects citizens and officials seamlessly, ensuring faster
          grievance resolution, transparent operations, and better community
          engagement.
        </p>
         {/* 👉 CTA Buttons placed here */}
        <div className="cta-buttons">
         <button onClick={() => navigate("/login")}>Get Started</button>
        <button onClick={() => navigate("/signup")} className="secondary">Join the Community
        </button>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services" >
        <h2>Our Services</h2>
        <div className="card-container">
          <div className="card">
            <h3>Citizen Portal</h3>
            <p>Register, report issues, and track updates easily.</p>
          </div>
          <div className="card">
            <h3>Official Dashboard</h3>
            <p>Manage tasks, monitor progress, and improve efficiency.</p>
          </div>
          <div className="card">
            <h3>Data Analytics</h3>
            <p>Visualize civic trends and make informed decisions.</p>
          </div>
        </div>
      </section>

     {/* Recent Feedback Section */}
<section className="recent-feedback">
  <h2>Recent Feedback</h2>

  {feedback.length === 0 ? (
    <p className="no-feedback">No feedback yet. Be the first!</p>
  ) : (
    <div className="feedback-cards">
      {feedback.slice(0, 3).map((fb, index) => (
        <div className="feedback-card" key={index}>
          
          {/* Avatar */}
          {/* <div className="avatar">
            {fb.name?.charAt(0)?.toUpperCase() || "U"}
          </div> */}

          <div className="feedback-content">
            <h4>{fb.name}</h4>
            <p className="message">“{fb.message}”</p>

            {/* Rating Stars */}
            <div className="stars">
              {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
            </div>

            <p className="date">{new Date(fb.createdAt).toDateString()}</p>
          </div>

        </div>
      ))}
    </div>
  )}
</section>


{/* Contact Section */}
<section id="contact" className="contact-section">
  <div className="contact-container">
    {/* Left Section */}
    <div className="contact-left">
      <h2>Get in Touch</h2>
      <p>
        Have a question, suggestion, or collaboration idea?  
        Reach out to <strong>Team Civix</strong> — we’d love to hear from you!
      </p>
      <ul>
        <li><strong>Email:</strong> contact@teamcivix.in</li>
        <li><strong>Phone:</strong> +91 99999 99999</li>
        <li><strong>Address:</strong> India</li>
      </ul>
    </div>

        {/* Vertical Divider */}
    <div className="divider"></div>

    {/* Right Section */}
    <div className="contact-right">
      <h2>Stay Connected</h2>
      <p>Follow us on social media for updates and upcoming features:</p>
            <div className="social-icons">
        <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram />
        </a>
        <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter />
        </a>
</div>

    </div>
  </div>
</section>


      <footer>
        <p>© 2025 Digital Civic Management | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default LandingPage;
