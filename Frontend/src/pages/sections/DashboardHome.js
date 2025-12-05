import React, { useEffect, useState } from "react";
import { FileText, BarChart2, Flag, Users,Bell, ArrowRight, MessageSquare } from "../../assets/icons";
import StatCard from "../StatCard";
import ContentCard from "../ContentCard";
import { FormButton } from "../FormControls";

  const DashboardHome = ({ user, setCurrentSection }) => {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [petitions, setPetitions] = useState([]);

  const [polls, setPolls] = useState([]);
const [feedbackCount, setFeedbackCount] = useState(0);
const [feedbackList, setFeedbackList] = useState([]);

//community
const [membersCount, setMembersCount] = useState(0);



  const [recentActivities, setRecentActivities] = useState([]);


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

useEffect(() => {
  const fetchPolls = async () => {
    try {
      const res = await fetch("http://localhost:8080/polls/all");
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const activePolls = data.data
          .filter((p) => p.status === "active")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // latest first

        setPolls(activePolls);
      } else {
        console.warn("Unexpected poll response:", data);
      }
    } catch (err) {
      console.error("Error fetching polls:", err);
    }
  };

  fetchPolls();
}, []);


// ✅ Fetch Feedback Count
useEffect(() => {
  const fetchFeedback = async () => {
    try {
      const res = await fetch("http://localhost:8080/feedback/all");
      const data = await res.json();

      if (data.success && Array.isArray(data.feedbacks)) {
        const sortedFeedback = data.feedbacks.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setFeedbackList(sortedFeedback);        // full
        setFeedbackCount(sortedFeedback.length); // count only
      } else {
        console.warn("Unexpected feedback response:", data);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  fetchFeedback();
}, []);

// ✅ Fetch community Count

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/users");
      const data = await res.json();

      if (data.success && Array.isArray(data.users)) {
        setMembersCount(data.users.length);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  fetchUsers();
}, []);


// dASHbOARD aCTIVITY lOGGER

useEffect(() => {
  const data = JSON.parse(localStorage.getItem("userActivity") || "[]");
  setRecentActivities(data);
}, []);


  const stats = [
    { title: "Active Petitions", value: petitions.length.toString(), icon: FileText, color: "blue" },
     { title: "Active Polls", value: polls.length.toString(), icon: BarChart2, color: "green" },
    { title: "Feedback Received", value: feedbackCount.toString(), icon: MessageSquare, color: "red" },
     { title: "Community Members", value: membersCount.toString(), icon: Users, color: "purple" },
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

      {/* ✅ Recent & Active Polls */}
<div className="main-content-col-span-2">
  <ContentCard
    title="Recent & Active Polls"
    icon={BarChart2}
    actions={
      <button
        className="view-all-button"
        onClick={() => setCurrentSection("polls")}
      >
        View All
      </button>
    }
  >
    <ul className="petition-list">
      {polls.length > 0 ? (
        polls.slice(0, 4).map((poll) => (
          <li key={poll._id} className="petition-list-item">
            <div>
              <h4 className="petition-list-item-title">{poll.question}</h4>
              <p className="petition-list-item-stats">
                {poll.totalVotes} votes
              </p>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fg"
                  style={{
                    width: `${Math.min((poll.totalVotes / 1000) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <button className="petition-list-item-button">View / Vote</button>
          </li>
        ))
      ) : (
        <p className="activity-empty-text">No active polls yet.</p>
      )}
    </ul>
  </ContentCard>
</div>

        {/* ✅ Recent Feedback */}

<div className="main-content-col-span-2">
  <ContentCard
    title="Recent Feedback"
    icon={Users}
    actions={
      <button
        className="view-all-button"
        onClick={() => setCurrentSection("feedback")}
      >
        View All
      </button>
    }
  >
    <ul className="petition-list">
      {feedbackList.length > 0 ? (
        feedbackList.slice(0, 4).map((fb) => (
          <li key={fb._id} className="petition-list-item">
            <div>
              <h4 className="petition-list-item-title">
                {fb.name || "Anonymous"}
              </h4>
              <p className="petition-list-item-stats">
                {fb.category} — {fb.feedbackType}
              </p>
            </div>

            <button className="petition-list-item-button">
              View
            </button>
          </li>
        ))
      ) : (
        <p className="activity-empty-text">No feedback submitted yet.</p>
      )}
    </ul>
  </ContentCard>
</div>

        
        {/* Activity Feed + Quick Actions */}
        <div className="main-content-col-right">
          <ContentCard 
            title="Your Recent Activity" 
            icon={Bell}
            // actions={<button className="view-all-button">View All</button>}
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

                   <FormButton
                      variant="secondary"
                      onClick={() => {
                        localStorage.setItem("openCreatePoll", "true");
                        setCurrentSection("polls");
                      }}
                    >
                      <BarChart2 size={18} /> Create a New Poll
                    </FormButton>

                     {/* Submit Feedback */}
                      <FormButton
                        variant="secondary"
                        onClick={() => {
                          localStorage.setItem("openCreateFeedback", "true");
                          setCurrentSection("feedback");
                        }}
                      >
                        <Flag size={18} /> Submit A Feedback Report
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
