import React from 'react';
import Navigation from '../Navigation/Navigation';
import Billboard from '../Billboard/Billboard';
import Forum from '../Forum/Forum';
import './Dashboard.css';

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard">
      <Navigation onLogout={handleLogout} />
      <div className="dashboard-content">
        <Billboard />
        <Forum />
      </div>
    </div>
  );
};

export default Dashboard;