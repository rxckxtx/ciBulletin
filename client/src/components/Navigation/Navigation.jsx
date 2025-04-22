import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New event posted', isNew: true, time: '2m ago' },
    { id: 2, text: 'Welcome to ciBULLETIN!', isNew: true, time: '5m ago' }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Apply theme
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isNew: false } : notif
    ));
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="nav-logo">
            <span className="logo-text">ci</span>BULLETIN
          </Link>
          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger"></span>
          </button>
        </div>

        <div className={`nav-content ${isMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <div className="nav-item-dropdown">
              <Link to="/events" className="nav-item">
                <span className="nav-item-icon">📅</span>
                Events
              </Link>
              <div className="dropdown-content">
                <Link to="/events/upcoming" className="dropdown-item">
                  <span className="dropdown-icon">📌</span>Upcoming
                </Link>
                <Link to="/events/past" className="dropdown-item">
                  <span className="dropdown-icon">📚</span>Past Events
                </Link>
                <Link to="/events/calendar" className="dropdown-item">
                  <span className="dropdown-icon">📆</span>Calendar
                </Link>
              </div>
            </div>

            <div className="nav-item-dropdown">
              <Link to="/forum" className="nav-item">
                <span className="nav-item-icon">💭</span>
                Forum
              </Link>
              <div className="dropdown-content">
                <Link to="/forum/general" className="dropdown-item">
                  <span className="dropdown-icon">🌐</span>General
                </Link>
                <Link to="/forum/academic" className="dropdown-item">
                  <span className="dropdown-icon">📖</span>Academic
                </Link>
                <Link to="/forum/clubs" className="dropdown-item">
                  <span className="dropdown-icon">👥</span>Clubs
                </Link>
              </div>
            </div>

            <Link to="/about" className="nav-item">
              <span className="nav-item-icon">ℹ️</span>
              About
            </Link>
          </div>

          <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
            <button type="submit" className="search-icon" aria-label="Submit search">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
              </svg>
            </button>
          </form>

          <div className="nav-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div className="notifications-wrapper">
              <button 
                className="notification-icon" 
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                </svg>
                {notifications.filter(n => n.isNew).length > 0 && (
                  <span className="notification-badge">
                    {notifications.filter(n => n.isNew).length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <h3>Notifications</h3>
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${notif.isNew ? 'new' : ''}`}
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <p>{notif.text}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login">Login</Link>
              <Link to="/signup" className="auth-btn signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;