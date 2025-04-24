import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Billboard.css';
import { fetchAnnouncements, fetchEvents } from '../../services/api';

// PosterTile component integrated directly into Billboard.js
const PosterTile = ({ announcement }) => {
  const { type, theme, size, urgent } = announcement;

  const tileStyle = {
    gridColumn: `span ${size.width}`,
    gridRow: `span ${size.height}`,
  };

  const getTileClasses = () => {
    const classes = ['poster-tile'];
    if (type) classes.push(`poster-type-${type}`);
    if (theme) classes.push(`theme-${theme}`);
    if (urgent) classes.push('poster-type-urgent');
    return classes.join(' ');
  };

  const renderIcon = () => {
    return <div className={`poster-icon poster-icon-${type}`} />;
  };

  const renderContent = () => {
    if (announcement.image) {
      return (
        <div className="poster-image">
          <img src={announcement.image} alt={announcement.title} />
        </div>
      );
    }
    return (
      <div className={`poster-default poster-type-${type}`}>
        <div className="poster-default-content">
          {renderIcon()}
          <h3>{announcement.title}</h3>
        </div>
      </div>
    );
  };

  return (
    <div className={getTileClasses()} style={tileStyle}>
      {renderContent()}
      <div className="poster-info">
        <div className="poster-metadata">
          <p><strong>Where:</strong> {announcement.location}</p>
          <p><strong>When:</strong> {announcement.date}</p>
          <p><strong>By:</strong> {announcement.group}</p>
        </div>
      </div>
    </div>
  );
};

const Billboard = () => {
  // State for data from backend
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const announcementsData = await fetchAnnouncements();
        const eventsData = await fetchEvents();
        
        setAnnouncements(announcementsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data if API fails
        setAnnouncements([
          {
            id: 1,
            title: 'Welcome Back Students!',
            image: require('../../misc/del.png'),
            location: 'Student Union',
            date: '2024-01-20',
            group: 'Student Life',
            type: 'event',
            theme: 'asi',
            size: { width: 2, height: 2 },
            urgent: false
          },
          {
            id: 2,
            title: 'STEM Research Symposium',
            location: 'Science Building',
            date: '2024-01-25',
            group: 'Biology Department',
            type: 'academic',
            theme: 'stem',
            size: { width: 1, height: 2 },
            urgent: true
          }
        ]);
        setEvents([
          { id: 1, title: 'Basketball Game', location: 'Main Gym', date: '2024-01-20' },
          { id: 2, title: 'Science Fair', location: 'Science Building', date: '2024-01-25' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Welcome to ciBULLETIN</h1>
        <p>Stay updated with the latest announcements and events</p>
      </section>

      <section className="announcements-section">
        <h2>Announcements</h2>
        {loading ? (
          <div className="loading-spinner">Loading announcements...</div>
        ) : (
          <div className="poster-grid">
            {announcements.map(announcement => (
              <PosterTile 
                key={announcement.id} 
                announcement={announcement}
              />
            ))}
          </div>
        )}
      </section>

      <section className="map-section">
        <h2>Event Locations</h2>
        <div className="map-placeholder">
          <p>Interactive map coming soon!</p>
          <div className="events-list">
            {loading ? (
              <p>Loading events...</p>
            ) : (
              events.map(event => (
                <div key={event.id} className="event-card">
                  <h3>{event.title}</h3>
                  <p>Location: {event.location}</p>
                  <p>Date: {event.date}</p>
                </div>
              ))
            )}
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