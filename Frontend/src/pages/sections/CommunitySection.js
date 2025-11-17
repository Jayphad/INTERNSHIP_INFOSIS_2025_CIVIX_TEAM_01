import React from 'react';
import ContentCard from '../ContentCard';
import { Users } from '../../assets/icons'; // ✅ from icons.js

const CommunitySection = () => (
  <div className="dashboard-section-placeholder">
    <h2 className="dashboard-section-title">Community</h2>
    <p className="dashboard-section-subtitle">
      Connect, collaborate, and share with other users in your community.
    </p>

    <ContentCard title="Community Forums" icon={<Users />}>
      <div className="placeholder-content">
        Community forum content will be displayed here.
      </div>
    </ContentCard>
  </div>
);

export default CommunitySection;
