import React, { useState, useEffect } from 'react';
import './Billboard.css';
import PosterTile from './PosterTile';
import EventForm from './EventForm';
import { fetchEvents, createEvent, checkDailyEventLimit } from '../../services/api';
import './Billboard.css';

const Billboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [canAddEvent, setCanAddEvent] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await fetchEvents();
        console.log('Events loaded:', data); // Debug log
        setAnnouncements(data); // We're still using the announcements state variable

        // Check if user can add more events today
        const limitCheck = await checkDailyEventLimit();
        setCanAddEvent(limitCheck.canAddMore);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
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
        <div className="loading-spinner">Loading events...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="poster-grid">
          {announcements.length > 0 ? (
            announcements.map(event => (
              <PosterTile
                key={event._id}
                announcement={event}
              />
            ))
          ) : (
            <div className="no-announcements">
              <p>No events to display.</p>
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