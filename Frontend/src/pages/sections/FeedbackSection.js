import React, { useState, useRef } from 'react';
import { FormButton } from '../FormControls';
import { UploadCloud, X } from '../../assets/icons';
import axios from 'axios';
import '../../styles/Feedback.css';

const API_URL = "http://localhost:8080"; // Your backend URL

const FeedbackSection = ({ user }) => {
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [feedbackType, setFeedbackType] = useState('suggestion'); 
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0); 
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      alert("You can only upload a maximum of 4 images.");
      return;
    }
    const newImages = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!category || !message || !feedbackType) {
    alert("Please fill in all required fields.");
    return;
  }
  if (!privacyAgreed) {
    alert("Please agree to the privacy notice.");
    return;
  }

  setIsSubmitting(true);

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("feedbackType", feedbackType);
  formData.append("category", category);
  formData.append("message", message);
  formData.append("rating", rating);
  images.forEach(img => formData.append("images", img.file));

  try {
    const token = localStorage.getItem("token"); // your JWT token
    const res = await fetch("http://localhost:8080/feedback/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert("Feedback submitted successfully!");

      // Reset all form states
      setName("");
      setEmail("");
      setFeedbackType("suggestion");
      setCategory("");
      setMessage("");
      setRating(0);
      setPrivacyAgreed(false);
      setImages([]);

      // Reset file input element
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } else {
      alert("Failed to submit feedback: " + (data.message || "Unknown error"));
    }


  } catch (err) {
    console.error(err);
    alert("An error occurred while submitting feedback.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="dashboard-section-placeholder">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">Feedback</h2>
      </div>
      <p className="dashboard-section-subtitle">
        We value your input! Let us know what you think about CIVIX or report any issues.
      </p>

      <div className="feedback-form-container">
        <form onSubmit={handleSubmit}>

          {/* --- Contact Info --- */}
          <div className="form-field-row">
            <div className="form-field-group">
              <label>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Your Name" 
                className="feedback-input"
              />
            </div>
            <div className="form-field-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="your@email.com" 
                className="feedback-input"
              />
            </div>
          </div>

          {/* --- Feedback Type (Radio) --- */}
          <div className="form-field-group">
            <label>Feedback Type</label>
            <div className="feedback-type-group">
              {['Bug Report', 'Suggestion', 'Complaint', 'Compliment'].map(type => {
                const value = type.toLowerCase().replace(' ', '_');
                return (
                  <label key={value} className={`feedback-type-label ${feedbackType === value ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="feedbackType" 
                      value={value} 
                      checked={feedbackType === value}
                      onChange={e => setFeedbackType(e.target.value)}
                      style={{display: 'none'}}
                    />
                    {type}
                  </label>
                );
              })}
            </div>
          </div>

          {/* --- Category Selector --- */}
          <div className="form-field-group">
            <label>Category / Topic</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="feedback-select">
              <option value="">Select a topic...</option>
              <option value="UI/UX">User Interface / Design</option>
              <option value="Login/Auth">Login & Account</option>
              <option value="Performance">Site Performance</option>
              <option value="Petitions">Petitions Feature</option>
              <option value="Polls">Polls Feature</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* --- Rating Scale --- */}
          {/* <div className="form-field-group">
            <label>Satisfaction Rating</label>
            <div className="feedback-rating-group">
              {[1,2,3,4,5].map(star => (
                <button 
                  key={star} 
                  type="button" 
                  className={`feedback-rating-star ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
              <span className="feedback-rating-text">
                {rating > 0 ? `${rating} Stars` : 'Click to rate'}
              </span>
            </div>
          </div> */}

          {/* --- Rating Scale --- */}
<div className="form-field-group">
  <label>Satisfaction Rating</label>

  <div className="feedback-rating-group">

    {/* Stars Row */}
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`feedback-rating-star ${rating >= star ? 'active' : ''}`}
          onClick={() => setRating(star)}
        >
          ★
        </button>
      ))}
    </div>

    {/* Rating Text */}
    <span className="feedback-rating-text">
      {rating > 0 ? `${rating} Stars` : "Click to rate"}
    </span>

  </div>
</div>


          {/* --- Message Box --- */}
          <div className="form-field-group">
            <label>Your Message</label>
            <textarea 
              rows="6" 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Please describe your feedback in detail..." 
              className="feedback-textarea"
            />
          </div>

          {/* --- File Upload --- */}
          <div className="form-field-group">
            <label>Screenshots / Images (Optional, Max 4)</label>
            {images.length > 0 && (
              <div className="feedback-image-previews">
                {images.map((img, index) => (
                  <div key={index} className="feedback-image-wrapper">
                    <img src={img.preview} alt="Preview" className="feedback-image" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)} 
                      className="feedback-remove-btn"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 4 && (
              <div className="feedback-upload-box" onClick={() => fileInputRef.current.click()}>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange} 
                  style={{display:'none'}} 
                  ref={fileInputRef} 
                />
                <div className="feedback-upload-content">
                  <UploadCloud size={32} />
                  <span className="feedback-upload-label">Click to upload images</span>
                  <span className="feedback-upload-hint">PNG, JPG, GIF up to 5MB</span>
                </div>
              </div>
            )}
          </div>

          {/* --- Privacy Notice --- */}
          <div className="form-field-group checkbox-group">
            <label className="feedback-privacy-label">
              <input 
                type="checkbox" 
                checked={privacyAgreed} 
                onChange={e => setPrivacyAgreed(e.target.checked)}
              />
              <span>I agree to share this feedback and understand that I may be contacted regarding this submission.</span>
            </label>
          </div>

          <div className="form-action-buttons">
            <FormButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </FormButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackSection;
