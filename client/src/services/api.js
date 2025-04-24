import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

// Add auth token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

// Announcements endpoints
export const fetchAnnouncements = async () => {
  const response = await api.get('/api/announcements');
  return response.data;
};

export const fetchAnnouncementById = async (id) => {
  const response = await api.get(`/api/announcements/${id}`);
  return response.data;
};

// Events endpoints
export const fetchEvents = async () => {
  const response = await api.get('/api/events');
  return response.data;
};

// Create a new event with image upload support
export const createEvent = async (eventData) => {
  try {
    console.log('Sending event data:', eventData);
    const response = await api.post('/api/events', eventData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error.response?.data || { message: 'Failed to create event' };
  }
};

export const checkDailyEventLimit = async () => {
  try {
    const response = await api.get('/api/events/check-limit');
    return response.data;
  } catch (error) {
    console.error('Error checking event limit:', error);
    // Return a default value instead of throwing an error
    return { limitReached: false };
  }
};

export default api;