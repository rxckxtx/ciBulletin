import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ onLogout }) => {
  return (
    <nav className="navigation">
      <Link to="/dashboard" className="nav-brand">ciBulletin</Link>
      <ul className="nav-menu">
        <li className="nav-item">
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link to="/resources">Resources</Link>
        </li>
        <li className="nav-item">
          <Link to="/forum">Forum</Link>
        </li>
        <li className="nav-item">
          <button onClick={onLogout} className="logout-button">Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;