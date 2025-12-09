import React from 'react';
import '../styles/FormControls.css';

/**
 * A styled input field with an optional icon.
 */
export const FormInput = ({ id, type, placeholder, icon: Icon, value, onChange, className = "" }) => (
  <div className="form-input-wrapper">
    {Icon && <Icon className="form-input-icon" />}
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`form-input ${Icon ? 'form-input-with-icon' : ''} ${className}`}
      required
    />
  </div>
);

/**
 * A styled button for form submissions.
 */
export const FormButton = ({ children, onClick, type = "submit", className = "", variant = "primary" }) => {
  const variantClass = variant === "primary" ? 'form-button-primary' : 'form-button-secondary';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`form-button ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
};

