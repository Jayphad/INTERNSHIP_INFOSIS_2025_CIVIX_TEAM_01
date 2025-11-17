import React from "react";
import "../styles/Dashboard.css";

const ContentCard = ({ title, icon: Icon, actions, children }) => (
  <div className="content-card">
    <div className="content-card-header">
      <div className="content-card-title">
        {Icon && <Icon size={18} />}
        <h3>{title}</h3>
      </div>
      {actions && <div className="content-card-actions">{actions}</div>}
    </div>
    <div className="content-card-body">{children}</div>
  </div>
);

export default ContentCard;
