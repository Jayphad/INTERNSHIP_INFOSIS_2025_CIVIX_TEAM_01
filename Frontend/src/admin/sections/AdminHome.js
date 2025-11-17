import React,{useEffect} from 'react';
import { FileText, BarChart2, Flag, Users, Bell, ArrowRight } from '../../assets/icons';
import StatCard from '../../pages/StatCard';

import ContentCard from '../../pages/ContentCard';
import { FormButton } from '../../pages/FormControls'; // ✅ Correct import
import { useState } from 'react';

/**
 * Dashboard Overview Section
 */
const DashboardHome = ({ user }) => {
  const stats = [
    { title: "Active Petitions", value: "1,204", icon: FileText, color: "blue" },
    { title: "Active Polls", value: "82", icon: BarChart2, color: "green" },
    { title: "Reports Filed", value: "531", icon: Flag, color: "red" },
    { title: "Community Members", value: "24,819", icon: Users, color: "purple" },
  ];

  const recentPetitions = [
    { id: 1, title: "Improve Public Park Safety and Lighting", signatures: 1250, goal: 2000, status: "Active" },
    { id: 2, title: "Install New Bike Lanes on Main Street", signatures: 842, goal: 1000, status: "Active" },
    { id: 3, title: "Petition for a New Community Rec Center", signatures: 450, goal: 5000, status: "Active" },
    { id: 4, title: "Support Local Farmers Market Initiative", signatures: 2100, goal: 2500, status: "Active" },
  ];

  const recentActivities = [
    { id: 1, type: "Petition Signed", description: "You signed 'Improve Public Park Safety'", time: "2 hours ago" },
    { id: 2, type: "Poll Voted", description: "You voted on 'New City Budget Priorities'", time: "1 day ago" },
    { id: 3, type: "Report Filed", description: "Report for 'Illegal Dumping' has been reviewed", time: "3 days ago" },
  ];
  const[loggedInUser,setLoggedInUser] = useState('');
  useEffect(() => {
          setLoggedInUser(localStorage.getItem('loggedInUser'));
        }, []);

  return (
    <div className="dashboard-page-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h2 className="welcome-banner-title">
          Welcome back, { loggedInUser || "Guest!!"}!
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
        {/* Recent Petitions */}
        <div className="main-content-col-span-2">
          <ContentCard 
            title="Recent & Trending Petitions" 
            icon={FileText}
            actions={<button className="view-all-button">View All</button>}
          >
            <ul className="petition-list">
              {recentPetitions.map((petition) => (
                <li key={petition.id} className="petition-list-item">
                  <div>
                    <h4 className="petition-list-item-title">{petition.title}</h4>
                    <p className="petition-list-item-stats">
                      {petition.signatures.toLocaleString()} signatures (
                      {((petition.signatures / petition.goal) * 100).toFixed(1)}% of goal)
                    </p>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fg" 
                        style={{ width: `${(petition.signatures / petition.goal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="petition-list-item-button">Sign / View</button>
                </li>
              ))}
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

          {/* Quick Actions */}
          <ContentCard title="Quick Actions" icon={ArrowRight}>
            <div className="quick-actions-list">
              <FormButton variant="primary">
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
