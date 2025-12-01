import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Download, FileText, BarChart2, Users } from '../../assets/icons';
import '../../styles/Reports.css';

const API_URL = "http://localhost:8080";

// =========================
// SMALL COMPONENTS
// =========================
const ReportStatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="report-stat-card">
    <div className="report-stat-header">
      <h3 className="report-stat-title">{title}</h3>
      <div className={`report-stat-icon ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="report-stat-body">
      <span className="report-stat-value">{value}</span>
    </div>
    <p className="report-stat-footer">Updated live</p>
  </div>
);

// =========================
// PIE CHART
// =========================
const PieChart = ({ data, colors }) => {
  const total = data.reduce((a, b) => a + b, 0);
  let currentAngle = 0;

  const gradientParts = data.map((val, i) => {
    const start = currentAngle;
    const deg = (val / total) * 360;
    currentAngle += deg;
    return `${colors[i]} ${start}deg ${currentAngle}deg`;
  });

  return (
    <div className="pie-chart-container">
      <div className="pie-chart" style={{ background: `conic-gradient(${gradientParts.join(", ")})` }} />
    </div>
  );
};

// =========================
// CHART CARD (STATUS + DISTRIBUTION)
// =========================
const ChartCard = ({ title, statusData, distributionData }) => {
  const [activeTab, setActiveTab] = useState("status");
  const data = activeTab === "status" ? statusData : distributionData;

  const total = data.values.reduce((a, b) => a + b, 0);

  return (
    <div className="report-chart-card">

      {/* HEADER */}
      <div className="chart-header-row">
        <div>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">
            {activeTab === "status" ? "Breakdown by Status" : "Distribution"}
          </p>
        </div>

        <div className="chart-card-tabs">
          <button className={`chart-tab-btn ${activeTab === "status" ? "active" : ""}`} onClick={() => setActiveTab("status")}>
            Status
          </button>
          <button className={`chart-tab-btn ${activeTab === "distribution" ? "active" : ""}`} onClick={() => setActiveTab("distribution")}>
            Distribution
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="chart-body-row">
        <div className="chart-wrapper">
          <PieChart data={data.values} colors={data.colors} />
        </div>

        <div className="chart-legend-side">
          {data.labels.map((label, i) => {
            const percent = ((data.values[i] / total) * 100).toFixed(0);
            return (
              <div key={i} className="legend-row">
                <div className="legend-info">
                  <span className="legend-dot" style={{ background: data.colors[i] }}></span>
                  <span className="legend-name">{label}</span>
                </div>
                <span className="legend-percent">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =========================
// MAIN REPORTS SECTION
// =========================
const ReportsSection = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  //for my activity tab
  const fetchMyActivity = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token"); // JWT from login
    const res = await axios.get(`${API_URL}/reports/my-activity`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setReportData(res.data.data);
  } catch (err) {
    console.error("Failed to fetch My Activity:", err);
  } finally {
    setLoading(false);
  }
};


  // FETCH BACKEND REPORT DATA
 useEffect(() => {
  const fetchReports = async () => {
    if (activeTab === "overview") {
      try {
        const res = await axios.get(`${API_URL}/reports/overview`);
        setReportData(res.data.data);
      } catch (err) {
        console.error("Report fetch error:", err);
      } finally {
        setLoading(false);
      }
    } else if (activeTab === "activity") {
      fetchMyActivity();
    }
  };
  fetchReports();
}, [activeTab]);


  if (loading) return <p>Loading analytics...</p>;
  if (!reportData) return <p>Error loading reports.</p>;

  // ========== Extracting values from backend ==========
  // const totals = reportData.totals;
  // const petitionStatus = reportData.petitions.status;
  // const petitionDistribution = reportData.petitions.byCategory;

  // const pollStatus = reportData.polls.status;
  // const pollLocationDist = reportData.polls.byLocation;

  // ========== Extracting values from backend ==========
  // FIX: Added optional chaining (?.) and fallbacks (|| {}) to prevent crashes
  const totals = reportData.totals || {}; 
  
  const petitionStatus = reportData.petitions?.status || {};
  const petitionDistribution = reportData.petitions?.byCategory || []; 

  const pollStatus = reportData.polls?.status || {};
  const pollLocationDist = reportData.polls?.byLocation || [];

  // =========================
  // CHART DATA FOR PETITIONS
  // =========================
  const petitionCharts = {
    status: {
      labels: Object.keys(petitionStatus),
      values: Object.values(petitionStatus),
      colors: ["#2563eb", "#f59e0b", "#16a34a", "#ef4444"]
    },
    distribution: {
      labels: petitionDistribution.map(d => d.category),
      values: petitionDistribution.map(d => d.count),
      colors: ["#8b5cf6", "#10b981", "#f43f5e", "#06b6d4", "#a855f7", "#14b8a6"]
    }
  };

  // =========================
  // CHART DATA FOR POLLS
  // =========================
  const pollCharts = {
    status: {
      labels: Object.keys(pollStatus),
      values: Object.values(pollStatus),
      colors: ["#16a34a", "#f59e0b", "#ef4444"]
    },
    distribution: {
      labels: pollLocationDist.map(d => d.location),
      values: pollLocationDist.map(d => d.count),
      colors: ["#3b82f6", "#f59e0b", "#06b6d4", "#94a3b8"]
    }
  };

  // =========================
// CHART DATA FOR MY PETITIONS
// =========================
const myPetitionCharts = {
  status: {
    labels: Object.keys(reportData.petitions.status || {}),
    values: Object.values(reportData.petitions.status || {}),
    colors: ["#2563eb", "#f59e0b", "#16a34a", "#ef4444"]
  },
  distribution: {
    labels: reportData.petitions.byCategory?.map(d => d.category) || [],
    values: reportData.petitions.byCategory?.map(d => d.count) || [],
    colors: ["#8b5cf6", "#10b981", "#f43f5e", "#06b6d4", "#a855f7", "#14b8a6"]
  }
};

// =========================
// CHART DATA FOR MY POLLS
// =========================
const myPollCharts = {
  status: {
    labels: Object.keys(reportData.polls.status || {}),
    values: Object.values(reportData.polls.status || {}),
    colors: ["#16a34a", "#f59e0b", "#ef4444"]
  },
  distribution: {
    labels: [], // Currently backend doesn’t return location for My Activity
    values: [],
    colors: []
  }
};


  //added the export pdf
  const handleExportPDF = async () => {
  try {
    const response = await fetch(`${API_URL}/reports/export/pdf`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("PDF download failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "Civix_Analytics_Report.pdf";
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export Error:", error);
  }
};


  return (
    <div className="dashboard-section-placeholder">

      {/* HEADER */}
      <div className="reports-section-header">
        <div>
          <h2 className="reports-section-title">Reports & Analytics</h2>
          <p className="reports-section-subtitle">
            Track civic engagement across petitions and polls.
          </p>
        </div>

        {/* EXPORT BUTTON (added) */}
        <button
          onClick={handleExportPDF}
          className="export-data-btn"
        >
          <Download size={18} style={{ marginRight: "6px" }} />
          Export Data
        </button>
      </div>


      {/* TOP STATS */}
      <div className="reports-stats-grid">
        <ReportStatCard
          title="Total Petitions"
          value={totals.petitions}
          icon={FileText}
          colorClass="icon-blue"
        />

        <ReportStatCard
          title="Total Polls"
          value={totals.polls}
          icon={BarChart2}
          colorClass="icon-green"
        />

        <ReportStatCard
          title="Active Engagement"
          value={totals.activeEngagement}
          icon={Users}
          colorClass="icon-purple"
        />
      </div>

      {/* TABS */}
      <div className="petition-tabs">
        <button className={`petition-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
          Community Overview
        </button>

        <button className={`petition-tab ${activeTab === "activity" ? "active" : ""}`} onClick={() => setActiveTab("activity")}>
          My Activity
        </button>
      </div>

      {/* CONTENT */}
     {activeTab === "overview" ? (
          <div className="reports-charts-grid">
            <ChartCard title="Petitions" statusData={petitionCharts.status} distributionData={petitionCharts.distribution} />
            <ChartCard title="Polls" statusData={pollCharts.status} distributionData={pollCharts.distribution} />
          </div>
        ) : (
          <div className="reports-charts-grid">
            <ChartCard title="My Petitions" statusData={myPetitionCharts.status} distributionData={myPetitionCharts.distribution} />
            <ChartCard title="My Polls" statusData={myPollCharts.status} distributionData={myPollCharts.distribution} />
          </div>
        )}
    </div>
  );
};

export default ReportsSection;
