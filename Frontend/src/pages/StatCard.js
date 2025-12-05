import React from "react";
import "../styles/Dashboard.css";

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`stat-card ${colorClass}`}>
    <div>
      <h4 className="stat-card-title">{title}</h4>
      <h2 className="stat-card-value">{value}</h2>
    </div>
    <div className=" stat-card-icon-wrapper" 
        style={{ '--color-bg-opacity': `var(--${colorClass}-bg-opacity)`, '--color-text': `var(--${colorClass}-text)` }}
        >
      <Icon size={28} className="stat-card-icon" />
    </div>
  </div>
);

export default StatCard;
