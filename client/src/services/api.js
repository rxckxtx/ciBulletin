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
  try {
    console.log('Fetching events from API...');
    const response = await api.get('/api/events');
    console.log('Events API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    // Return an empty array instead of throwing an error
    return [];
  }
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

// Forum endpoints
export const fetchForums = async () => {
  const response = await api.get('/api/forums');
  return response.data;
};

export const fetchForumById = async (id) => {
  const response = await api.get(`/api/forums/${id}`);
  return response.data;
};

export const createForum = async (forumData) => {
  const response = await api.post('/api/forums', forumData);
  return response.data;
};

export const updateForum = async (id, forumData) => {
  const response = await api.put(`/api/forums/${id}`, forumData);
  return response.data;
};

export const deleteForum = async (id) => {
  const response = await api.delete(`/api/forums/${id}`);
  return response.data;
};

// Topic endpoints
export const fetchTopicsByForum = async (forumId) => {
  const response = await api.get(`/api/topics/forum/${forumId}`);
  return response.data;
};

export const fetchTopicById = async (id) => {
  const response = await api.get(`/api/topics/${id}`);
  return response.data;
};

export const createTopic = async (topicData) => {
  const response = await api.post('/api/topics', topicData);
  return response.data;
};

export const updateTopic = async (id, topicData) => {
  const response = await api.put(`/api/topics/${id}`, topicData);
  return response.data;
};

export const deleteTopic = async (id) => {
  const response = await api.delete(`/api/topics/${id}`);
  return response.data;
};

export const togglePinTopic = async (id) => {
  const response = await api.patch(`/api/topics/${id}/pin`);
  return response.data;
};

export const toggleLockTopic = async (id) => {
  const response = await api.patch(`/api/topics/${id}/lock`);
  return response.data;
};

// Post endpoints
export const fetchPostsByTopic = async (topicId) => {
  const response = await api.get(`/api/posts/topic/${topicId}`);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post('/api/posts', postData);
  return response.data;
};

export const updatePost = async (id, postData) => {
  const response = await api.put(`/api/posts/${id}`, postData);
  return response.data;
};

export const deletePost = async (id) => {
  const response = await api.delete(`/api/posts/${id}`);
  return response.data;
};

export const toggleLikePost = async (id) => {
  const response = await api.patch(`/api/posts/${id}/like`);
  return response.data;
};

export const fetchThreads = async (category = null) => {
  try {
    const url = category
      ? `/api/forum?category=${category}`
      : '/api/forum';

    // Use the axios instance instead of fetch
    const response = await api.get(url);
    console.log('Threads API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchThreads:', error);
    throw error;
  }
};

export const fetchThreadById = async (id, isRefresh = false) => {
  try {
    // Check if id is valid before making the API call
    if (!id) {
      throw new Error('Invalid thread ID');
    }

    // Add a header to indicate if this is a refresh request
    const headers = isRefresh ? { 'x-refresh-request': 'true' } : {};

    const response = await api.get(`/api/forum/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error in fetchThreadById:', error);
    throw error;
  }
};

export const createThread = async (threadData) => {
  const response = await api.post('/api/forum', threadData);
  return response.data;
};

export const addPost = async (threadId, postData) => {
  const response = await api.post(`/api/forum/${threadId}/posts`, postData);
  return response.data;
};

export const deleteThread = async (threadId) => {
  const response = await api.delete(`/api/forum/${threadId}`);
  return response.data;
};

export const deleteForumPost = async (threadId, postId) => {
  const response = await api.delete(`/api/forum/${threadId}/posts/${postId}`);
  return response.data;
};

// Resource Hub endpoints
export const fetchResources = async (params = {}) => {
  const queryParams = new URLSearchParams();

  // Add any provided parameters to the query string
  if (params.category) queryParams.append('category', params.category);
  if (params.fileType) queryParams.append('fileType', params.fileType);
  if (params.search) queryParams.append('search', params.search);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.page) queryParams.append('page', params.page);

  const url = `/api/resources?${queryParams.toString()}`;
  const response = await api.get(url);
  return response.data;
};

export const fetchResourceById = async (id) => {
  const response = await api.get(`/api/resources/${id}`);
  return response.data;
};

export const createResource = async (resourceData) => {
  try {
    const response = await api.post('/api/resources', resourceData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error.response?.data || { message: 'Failed to create resource' };
  }
};

export const updateResource = async (id, resourceData) => {
  const response = await api.put(`/api/resources/${id}`, resourceData);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await api.delete(`/api/resources/${id}`);
  return response.data;
};

export const downloadResource = async (id) => {
  // This will trigger a file download, so we need to handle it differently
  window.open(`${api.defaults.baseURL}/api/resources/${id}/download`, '_blank');
};

export const fetchUserResources = async (userId = null) => {
  const url = userId ? `/api/resources/user/${userId}` : '/api/resources/user';
  const response = await api.get(url);
  return response.data;
};

export default api;
