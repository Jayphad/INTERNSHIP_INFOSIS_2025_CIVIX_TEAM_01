import React, { useState, useEffect } from "react";
import DashboardHeader from "../pages/DashboardHeader";
import DashboardSidebar from "../pages/DashboardSidebar";
import AdminHome from "./sections/AdminHome";
import ReviewPetitions from "./sections/AdminPetitionsSection";
import AdminPollsSection from "./sections/AdminPollsSection"; // Import the new section

import {
  FileText,
  BarChart2,
  Settings,
  LayoutDashboard,
} from "../assets/icons";

// import "../styles/AdminPolls.css";

const AdminDashboard = ({ user }) => {
  // ✅ Define admin-specific sidebar options
  const navItems = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "review", label: "Manage Petitions", icon: FileText },
    { id: "polls", label: "Manage Polls", icon: BarChart2 }, // Added Polls
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [label, setLabel] = useState("Dashboard");
  const [currentSection, setCurrentSection] = useState("home");

  // ✅ Update header label dynamically
  useEffect(() => {
    const current = navItems.find((item) => item.id === currentSection);
    setLabel(current ? current.label : "Dashboard");
  }, [currentSection]);

  // ✅ Render section dynamically
  const renderSection = () => {
    switch (currentSection) {
      case "home":
        return <AdminHome />;
      case "review":
        return <ReviewPetitions />;
      case "polls":
        return <AdminPollsSection />; // Added Case
      case "settings":
         return <div className="dashboard-section-placeholder"><h3>Settings</h3><p>System configuration coming soon.</p></div>;
      default:
        return <AdminHome />;
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        navItems={navItems}
        isOpen={isSidebarOpen}
        setCurrentSection={setCurrentSection}
        currentSection={currentSection}
      />

      <div className="dashboard-main" style={{ width: "100%" }}>
        <DashboardHeader
          user={user}
          heading={label}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
        <main className="dashboard-content">{renderSection()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;