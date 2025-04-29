import React, { useState, useEffect } from 'react';
import './Billboard.css';
import PosterTile from './PosterTile';
import EventForm from './EventForm';
import { fetchEvents, createEvent, checkDailyEventLimit, deleteEvent } from '../../services/api';
import './Billboard.css';

const Billboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadEvents = async (includeArchived = showArchived) => {
    try {
      setLoading(true);
      const data = await fetchEvents(includeArchived);
      console.log('Events loaded:', data); // Debug log
      setAnnouncements(data); // We're still using the announcements state variable

      // Check daily event limit (not currently used in UI)
      await checkDailyEventLimit();
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      setStatusMessage('Event created successfully!');

      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000);

      // Check daily event limit (not currently used in UI)
      await checkDailyEventLimit();
    } catch (err) {
      console.error('Error creating event:', err);
      throw err; // Let the form component handle the error
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);

      // Remove the deleted event from the state
      setAnnouncements(announcements.filter(event => event._id !== eventId));

      setStatusMessage('Event deleted successfully!');

      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(`Failed to delete event: ${err.message}`);

      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleArchivedEvents = () => {
    const newShowArchived = !showArchived;
    setShowArchived(newShowArchived);
    loadEvents(newShowArchived);
  };

  return (
    <div className="billboard">
      <div className="billboard-header">
        <h2>Campus Bulletin Board</h2>
        <div className="billboard-actions">
          <button
            className="toggle-archived-button"
            onClick={toggleArchivedEvents}
            style={{
              backgroundColor: showArchived ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              marginRight: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {showArchived ? 'Hide Past Events' : 'Show Past Events'}
          </button>
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
              cursor: 'pointer'
            }}
          >
            + Add Event
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="status-message success">
          {statusMessage}
        </div>
      )}

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
                onDelete={handleDeleteEvent}
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