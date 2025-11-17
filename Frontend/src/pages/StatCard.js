import React from "react";
import "../styles/Dashboard.css";

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`stat-card ${colorClass}`}>
    <div>
      <h4 className="stat-card-title">{title}</h4>
      <h2 className="stat-card-value">{value}</h2>
    </div>
    <div className="stat-card-icon">
      <Icon size={28} />
    </div>
  </div>
);

export default StatCard;
