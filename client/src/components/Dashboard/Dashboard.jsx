import React from 'react';
import Billboard from '../Billboard/Billboard';
import Forum from '../Forum/Forum';
import './Dashboard.css';

const Dashboard = () => {

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <Billboard />
        <Forum />
      </div>
    </div>
  );
};

export default Dashboard;