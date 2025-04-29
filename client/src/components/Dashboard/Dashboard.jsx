import React from 'react';
import Billboard from '../Billboard/Billboard';
import DashboardForum from './DashboardForum';
import './Dashboard.css';
import './DashboardForum.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <Billboard />
        <DashboardForum />
      </div>
    </div>
  );
};

export default Dashboard;