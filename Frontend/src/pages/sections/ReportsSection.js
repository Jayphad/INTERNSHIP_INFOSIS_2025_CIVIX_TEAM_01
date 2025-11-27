import React, { useState } from 'react';
import { Filter, Download, FileText, BarChart2, Users } from '../../assets/icons';
import '../../styles/Reports.css';

// --- Components for the Reports Dashboard ---

const ReportStatCard = ({ title, value, trend, trendUp, icon: Icon, colorClass }) => (
  <div className="report-stat-card">
    <div className="report-stat-header">
      <h3 className="report-stat-title">{title}</h3>
      <div className={`report-stat-icon ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="report-stat-body">
      <span className="report-stat-value">{value}</span>
      <span className={`report-stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
        {trendUp ? '↗' : '↘'} {trend}
      </span>
    </div>
    <p className="report-stat-footer">from last month</p>
  </div>
);

const PieChart = ({ data, colors }) => {
  const total = data.reduce((acc, val) => acc + val, 0);
  let currentAngle = 0;
  const gradientParts = data.map((val, i) => {
    const start = currentAngle;
    const degrees = (val / total) * 360;
    currentAngle += degrees;
    return `${colors[i]} ${start}deg ${currentAngle}deg`;
  });
  
  const gradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="pie-chart-container">
      <div className="pie-chart" style={{ background: gradient }}></div>
    </div>
  );
};

// --- Chart Card with Side Legend and Percentages ---
const ChartCard = ({ title, statusData, distributionData }) => {
  const [activeTab, setActiveTab] = useState('status'); // 'status' or 'distribution'

  const currentData = activeTab === 'status' ? statusData : distributionData;
  
  // Calculate total to derive percentages
  const total = currentData.values.reduce((acc, val) => acc + val, 0);

  return (
    <div className="report-chart-card">
      <div className="chart-header-row">
        <div>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">
            {activeTab === 'status' ? 'Breakdown by Status' : 'Distribution by Category'}
          </p>
        </div>
        {/* Tabs for switching views */}
        <div className="chart-card-tabs">
          <button 
            className={`chart-tab-btn ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            Status
          </button>
          <button 
            className={`chart-tab-btn ${activeTab === 'distribution' ? 'active' : ''}`}
            onClick={() => setActiveTab('distribution')}
          >
            Distribution
          </button>
        </div>
      </div>

      <div className="chart-body-row">
         <div className="chart-wrapper">
            <PieChart 
                data={currentData.values} 
                colors={currentData.colors} 
            />
         </div>
         
         {/* Side Legend with Percentages */}
         <div className="chart-legend-side">
            {currentData.labels.map((label, i) => {
               const percentage = ((currentData.values[i] / total) * 100).toFixed(0);
               return (
                 <div key={i} className="legend-row">
                    <div className="legend-info">
                      <span className="legend-dot" style={{background: currentData.colors[i]}}></span>
                      <span className="legend-name">{label}</span>
                    </div>
                    <span className="legend-percent">{percentage}%</span>
                 </div>
               );
            })}
         </div>
      </div>
    </div>
  );
};


const ReportsSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      alert("Report data exported successfully!");
      setIsExporting(false);
    }, 1500);
  };

  // --- MOCK CHART DATA ---
  const petitionCharts = {
    status: {
      values: [76, 18, 6], // Adjusted to match your example: Active 76, Review 18, Closed 6
      colors: ['#2563eb', '#f59e0b', '#ef4444'],
      labels: ['Active', 'Under Review', 'Closed']
    },
    distribution: {
      values: [40, 30, 20, 10],
      colors: ['#8b5cf6', '#10b981', '#f43f5e', '#06b6d4'],
      labels: ['Community', 'Environment', 'Safety', 'Other']
    }
  };

  const pollCharts = {
    status: {
      values: [45, 30, 25],
      colors: ['#16a34a', '#f59e0b', '#94a3b8'],
      labels: ['Active', 'Under Review', 'Closed']
    },
    distribution: {
      values: [50, 50],
      colors: ['#f59e0b', '#3b82f6'],
      labels: ['Local Gov', 'Public Opinion']
    }
  };

  return (
    <div className="dashboard-section-placeholder">
      
      {/* Header Section */}
      <div className="reports-section-header">
        <div>
          <h2 className="reports-section-title">Reports & Analytics</h2>
          <p className="reports-section-subtitle">Track civic engagement and measure the impact of petitions and polls.</p>
        </div>
        <button 
          className="export-data-btn" 
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download size={18} />
          {isExporting ? "Exporting..." : "Export Data"}
        </button>
      </div>

      {/* Top Stats Row */}
      <div className="reports-stats-grid">
        <ReportStatCard 
          title="Total Petitions" 
          value="3" 
          trend="12%" 
          trendUp={true}
          icon={FileText}
          colorClass="icon-blue"
        />
        <ReportStatCard 
          title="Total Polls" 
          value="8" 
          trend="8%" 
          trendUp={true}
          icon={BarChart2}
          colorClass="icon-green"
        />
        <ReportStatCard 
          title="Active Engagement" 
          value="3,450" 
          trend="2%" 
          trendUp={false}
          icon={Users}
          colorClass="icon-purple"
        />
      </div>

      {/* Tabs */}
      <div className="petition-tabs">
        <button 
          className={`petition-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Community Overview
        </button>
        <button 
          className={`petition-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          My Activity
        </button>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'overview' ? (
        <div className="reports-charts-grid">
          
          {/* Updated Chart Cards with Tabs */}
          <ChartCard 
            title="Petitions" 
            statusData={petitionCharts.status}
            distributionData={petitionCharts.distribution}
          />

          <ChartCard 
            title="Polls" 
            statusData={pollCharts.status}
            distributionData={pollCharts.distribution}
          />

        </div>
      ) : (
        /* My Activity Placeholder */
        <div className="placeholder-content">
           <p>Your personal activity history and generated reports will appear here.</p>
        </div>
      )}

    </div>
  );
};

export default ReportsSection;