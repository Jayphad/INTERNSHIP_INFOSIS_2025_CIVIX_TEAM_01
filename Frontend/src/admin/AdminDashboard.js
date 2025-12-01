import React, { useState, useEffect } from "react";
import DashboardHeader from "../pages/DashboardHeader";
import DashboardSidebar from "../pages/DashboardSidebar";
import AdminHome from "./sections/AdminHome";
import ReviewPetitions from "./sections/AdminPetitionsSection";
import AdminPollsSection from "./sections/AdminPollsSection"; 
import SettingsSection from "../pages/sections/SettingsSection";
import AdminCommunitySection from "./sections/AdminCommunitySection";
import AdminFeedbackSection from "./sections/AdminFeedbackSection";
import ReportsSection from "../pages/sections/ReportsSection";
import AdminHelpSection from "./sections/AdminHelpSection";

import {
  FileText,
  BarChart2,
  Settings,
  LayoutDashboard,
  Users,
  MessageSquare,
  Flag,
} from "../assets/icons";

// import "../styles/AdminPolls.css";

const AdminDashboard = ({ user }) => {
  // ✅ Define admin-specific sidebar options
  const navItems = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "review", label: "Manage Petitions", icon: FileText },
    { id: "polls", label: "Manage Polls", icon: BarChart2 }, // Added Polls
    { id: "community", label: "Manage Community", icon: Users},
    { id: "feedback", label: "Manage Feedback", icon: MessageSquare },
    { id: "reports", label: "Reports", icon: Flag },
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
      case "community":
        return <AdminCommunitySection />; 
      case "feedback":
        return <AdminFeedbackSection />; 
      case "reports":
        return <ReportsSection />; 
      case "settings":
         return <SettingsSection user={user} />;
      case "help":
         return <AdminHelpSection user={user} />;
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