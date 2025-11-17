import React, { useEffect, useState } from "react";
import { FileText, BarChart2, Flag, Users, ArrowRight } from "../../assets/icons";
import StatCard from "../StatCard";
import ContentCard from "../ContentCard";
import { FormButton } from "../FormControls";

const DashboardHome = ({ user, setCurrentSection }) => {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [petitions, setPetitions] = useState([]);


  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"));
  }, []);

  // ✅ Fetch active petitions from backend
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const response = await fetch("http://localhost:8080/petition/all");
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setPetitions(data.data.filter((p) => !p.isClosed));
        } else {
          console.warn("Unexpected petition response:", data);
        }
      } catch (err) {
        console.error("Error fetching petitions:", err);
      }
    };
    fetchPetitions();
  }, []);

  const stats = [
    { title: "Active Petitions", value: petitions.length.toString(), icon: FileText, color: "blue" },
    { title: "Active Polls", value: "82", icon: BarChart2, color: "green" },
    { title: "Reports Filed", value: "531", icon: Flag, color: "red" },
    { title: "Community Members", value: "24,819", icon: Users, color: "purple" },
  ];

  return (
    <div className="dashboard-page-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h2 className="welcome-banner-title">
          Welcome back, {loggedInUser || "Guest"}!
        </h2>
        <p className="welcome-banner-subtitle">
          Here's a quick overview of what's happening in your community today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.color}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* ✅ Recent & Trending Petitions */}
        <div className="main-content-col-span-2">
          <ContentCard
            title="Recent & Trending Petitions"
            icon={FileText}
            actions={
              <button
                className="view-all-button"
                onClick={() => setCurrentSection("petitions")}
              >
                View All
              </button>
            }
          >
            <ul className="petition-list">
              {petitions.length > 0 ? (
                petitions.slice(0, 4).map((petition) => (
                  <li key={petition._id} className="petition-list-item">
                    <div>
                      <h4 className="petition-list-item-title">{petition.title}</h4>
                      <p className="petition-list-item-stats">
                        {petition.signatures.length} signatures
                      </p>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fg"
                          style={{
                            width: `${Math.min(
                              (petition.signatures.length / 1000) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <button className="petition-list-item-button">View / Sign</button>
                  </li>
                ))
              ) : (
                <p className="activity-empty-text">No active petitions yet.</p>
              )}
            </ul>
          </ContentCard>
        </div>

        {/* ✅ Quick Actions */}
        <div className="main-content-col-right">
          <ContentCard title="Quick Actions" icon={ArrowRight}>
            <div className="quick-actions-list">
              <FormButton
                variant="primary"
                onClick={() => {
                  // Save flag and go to Petition section
                  localStorage.setItem("openCreatePetition", "true");
                  setCurrentSection("petitions");
                }}
              >
                <FileText size={18} /> Start a New Petition
              </FormButton>

              <FormButton variant="secondary">
                <BarChart2 size={18} /> Create a New Poll
              </FormButton>
              <FormButton variant="secondary">
                <Flag size={18} /> File a New Report
              </FormButton>
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
