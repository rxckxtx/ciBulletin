import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Announcements API
export const fetchAnnouncements = async () => {
  try {
    const response = await api.get('/announcements');
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

// Events API
export const fetchEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Add announcement
export const addAnnouncement = async (announcementData) => {
  try {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  } catch (error) {
    console.error('Error adding announcement:', error);
    throw error;
  }
};

// Update announcement
export const updateAnnouncement = async (id, announcementData) => {
  try {
    const response = await api.put(`/announcements/${id}`, announcementData);
    return response.data;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

// Delete announcement
export const deleteAnnouncement = async (id) => {
  try {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

export default api;