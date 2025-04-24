import React from 'react';
import './Navigation.css';

const Navigation = ({ onLogout }) => {
  return (
    <nav className="navigation">
      <div className="nav-brand">ciBulletin</div>
      <ul className="nav-menu">
        <li className="nav-item">Dashboard</li>
        <li className="nav-item">Announcements</li>
        <li className="nav-item">Events</li>
        <li className="nav-item">
          <button onClick={onLogout} className="logout-button">Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;