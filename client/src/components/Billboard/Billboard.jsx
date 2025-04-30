import React, { useState, useEffect } from 'react';
import PosterTile from './PosterTile';
import EventForm from './EventForm';
import { fetchEvents, createEvent, checkDailyEventLimit, deleteEvent } from '../../services/api';

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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Campus Bulletin Board</h2>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1.5 rounded text-white text-sm font-medium transition-colors ${
              showArchived ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            onClick={toggleArchivedEvents}
          >
            {showArchived ? 'Hide Past Events' : 'Show Past Events'}
          </button>
          <button
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
            onClick={handleAddEvent}
          >
            + Add Event
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-green-50 text-green-700 text-sm border-b border-green-100">
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-500">
          Loading events...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {announcements.length > 0 ? (
            announcements.map(event => (
              <PosterTile
                key={event._id}
                announcement={event}
                onDelete={handleDeleteEvent}
              />
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-2">No events to display.</p>
              <p className="text-gray-500">Be the first to add an event!</p>
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