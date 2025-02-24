import React from 'react';
import { Link } from 'react-router-dom';
import './Billboard.css';

const Billboard = () => {
  // Mock data for announcements and events
  const announcements = [
    { id: 1, title: 'Welcome Back Students!', content: 'We hope you had a great summer break.' },
    { id: 2, title: 'Upcoming Career Fair', content: 'Join us next week for the annual career fair.' },
  ];

  const events = [
    { id: 1, title: 'Basketball Game', location: 'Main Gym', date: '2024-01-20' },
    { id: 2, title: 'Science Fair', location: 'Science Building', date: '2024-01-25' },
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>School Digital Billboard</h1>
        <p>Stay updated with the latest announcements and events</p>
      </section>

      <section className="announcements-section">
        <h2>Announcements</h2>
        <div className="announcements-grid">
          {announcements.map(announcement => (
            <div key={announcement.id} className="announcement-card">
              <h3>{announcement.title}</h3>
              <p>{announcement.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="map-section">
        <h2>Event Locations</h2>
        <div className="map-placeholder">
          {/* Map component will be added here */}
          <p>Interactive map coming soon!</p>
          <div className="events-list">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <h3>{event.title}</h3>
                <p>Location: {event.location}</p>
                <p>Date: {event.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="forum-preview">
        <h2>Recent Discussions</h2>
        <div className="forum-preview-content">
          <p>Join the conversation in our student forum!</p>
          <Link to="/forum" className="forum-link">Go to Forum →</Link>
        </div>
      </section>
    </div>
  );
};

export default Billboard;