import React, { useEffect, useState } from "react";
import { FileText, BarChart2, Flag, Users,Bell, ArrowRight } from "../../assets/icons";
import StatCard from "../StatCard";
import ContentCard from "../ContentCard";
import { FormButton } from "../FormControls";

  const DashboardHome = ({ user, setCurrentSection }) => {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [petitions, setPetitions] = useState([]);

  const recentActivities = [
    { id: 1, type: "Petition Signed", description: "You signed 'Improve Public Park Safety'", time: "2 hours ago" },
    { id: 2, type: "Poll Voted", description: "You voted on 'New City Budget Priorities'", time: "1 day ago" },
    { id: 3, type: "Report Filed", description: "Report for 'Illegal Dumping' has been reviewed", time: "3 days ago" },
  ];

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
        
        {/* Activity Feed + Quick Actions */}
        <div className="main-content-col-right">
          <ContentCard 
            title="Your Recent Activity" 
            icon={Bell}
            actions={<button className="view-all-button">View All</button>}
          >
            <ul className="activity-list">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <li key={activity.id} className="activity-list-item">
                    <div className="activity-icon-wrapper">
                      {activity.type === "Petition Signed" && <FileText className="activity-icon activity-icon-blue" />}
                      {activity.type === "Poll Voted" && <BarChart2 className="activity-icon activity-icon-green" />}
                      {activity.type === "Report Filed" && <Flag className="activity-icon activity-icon-red" />}
                    </div>
                    <div>
                      <p className="activity-description">{activity.description}</p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="activity-empty-text">No recent activity.</p>
              )}
            </ul>
          </ContentCard>
        
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
    </div>
  );
};

export default DashboardHome;
