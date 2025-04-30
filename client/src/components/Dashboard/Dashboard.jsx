import React from 'react';
import Billboard from '../Billboard/Billboard';
import DashboardForum from './DashboardForum';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <Billboard />
        </div>
        <div className="w-full md:w-1/3">
          <DashboardForum />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;