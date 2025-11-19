import React, { useState, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHome from "./sections/DashboardHome";
import PetitionsSection from "./sections/PetitionsSection";
import PollsSection from "./sections/PollsSection";
import ReportsSection from "./sections/ReportsSection";
import CommunitySection from "./sections/CommunitySection";
import "../styles/Dashboard.css";
import {
  FileText,
  BarChart2,
  Flag,
  Users,
  LayoutDashboard,
} from "../assets/icons";

const Dashboard = ({ user }) => {
  const navItems = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "petitions", label: "Petitions", icon: FileText },
    { id: "polls", label: "Polls", icon: BarChart2 },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "community", label: "Community", icon: Users },
  ];

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [label, setLabel] = useState("Dashboard");
  const [currentSection, setCurrentSection] = useState("home");
  const [showModal, setShowModal] = useState(false);

  // ✅ Update label whenever currentSection changes
  useEffect(() => {
    switch (currentSection) {
      case "home":
        setLabel("Dashboard");
        break;
      case "petitions":
        setLabel("Petitions");
        break;
      case "polls":
        setLabel("Polls");
        break;
      case "reports":
        setLabel("Reports");
        break;
      case "community":
        setLabel("Community");
        break;
      default:
        setLabel("Dashboard");
    }
  }, [currentSection]);

  const renderSection = () => {
  switch (currentSection) {
    case "home":
      return (
            <DashboardHome
          user={user}
          onStartPetition={() => setCurrentSection("petitions")}
          setCurrentSection={setCurrentSection}
    />
    );
    case "petitions":
      return <PetitionsSection showCreateModal={showModal} setShowCreateModal={setShowModal} user={user}/>;
    case "polls":
      return <PollsSection user={user}/>;
    case "reports":
      return <ReportsSection user={user}/>;
    case "community":
      return <CommunitySection user={user}/>;
    default:
      return <DashboardHome user={user} />;
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

      <div className="neobar"></div>
    </div>
  );
};

export default Dashboard;
