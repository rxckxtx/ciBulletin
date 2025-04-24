import React, { useState, useEffect } from 'react';
import './Billboard.css';
import PosterTile from './PosterTile';
import EventForm from './EventForm';
import { fetchAnnouncements, createEvent, checkDailyEventLimit } from '../../services/api';
import './Billboard.css';

const Billboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [canAddEvent, setCanAddEvent] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await fetchAnnouncements();
        setAnnouncements(data);
        
        // Check if user can add more events today
        const limitCheck = await checkDailyEventLimit();
        setCanAddEvent(limitCheck.canAddMore);
      } catch (err) {
        console.error('Error loading announcements:', err);
        setError('Failed to load announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const handleAddEvent = () => {
    setShowEventForm(true);
  };

  const handleEventSubmit = async (eventData) => {
    try {
      const newEvent = await createEvent(eventData);
      setAnnouncements([newEvent, ...announcements]);
      setShowEventForm(false);
      
      // Update the daily limit status
      const limitCheck = await checkDailyEventLimit();
      setCanAddEvent(limitCheck.canAddMore);
    } catch (err) {
      console.error('Error creating event:', err);
      throw err; // Let the form component handle the error
    }
  };

  return (
    <div className="billboard">
      <div className="billboard-header">
        <h2>Campus Bulletin Board</h2>
        <button 
          className="add-event-button" 
          onClick={handleAddEvent}
          style={{ 
            backgroundColor: '#ce1c40',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'block' // Force display
          }}
        >
          + Add Event
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="poster-grid">
          {announcements.length > 0 ? (
            announcements.map(announcement => (
              <PosterTile 
                key={announcement._id} 
                announcement={announcement} 
              />
            ))
          ) : (
            <div className="no-announcements">
              <p>No announcements to display.</p>
              <p>Be the first to add an event!</p>
            </div>
          )}
        </div>
      )}

      {showEventForm && (
        <EventForm 
          onSubmit={handleEventSubmit} 
          onCancel={() => setShowEventForm(false)} 
        />
      )}
    </div>
  );
};

export default Billboard;