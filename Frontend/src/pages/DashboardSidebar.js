import React from "react";
import {
  FileText,
  BarChart2,
  Flag,
  Users,
  Settings,
  HelpCircle,
  LayoutDashboard,
} from "../assets/icons";
import "../styles/Dashboard.css";

const DashboardSidebar = ({navItems, isOpen, setCurrentSection, currentSection }) => {

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="sidebar-mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <LayoutDashboard className="sidebar-logo" />
          <h2 className="sidebar-title">Civix</h2>
        </div>
      </div>

      <ul className="sidebar-nav-list">
        {navItems.map((item) => (
          <li key={item.id} className="sidebar-nav-item">
            <button
              onClick={() => setCurrentSection(item.id)}
              className={currentSection === item.id ? "active" : ""}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button>
          <Settings /> Settings
        </button>
        <button>
          <HelpCircle /> Help
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
