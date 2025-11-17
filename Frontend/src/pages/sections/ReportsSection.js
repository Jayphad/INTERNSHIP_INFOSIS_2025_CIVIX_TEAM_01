import React from 'react';
import ContentCard from '../ContentCard';
import { Flag } from '../../assets/icons'; // ✅ from icons.js

const ReportsSection = () => (
  <div className="dashboard-section-placeholder">
    <h2 className="dashboard-section-title">Reports</h2>
    <p className="dashboard-section-subtitle">
      View your filed reports or submit a new one.
    </p>

    <ContentCard title="My Reports" icon={<Flag />}>
      <div className="placeholder-content">
        Your reports will appear here.
      </div>
    </ContentCard>
  </div>
);

export default ReportsSection;
