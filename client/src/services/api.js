import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || window.location.origin,
  withCredentials: true, // This allows cookies to be sent with requests
  timeout: 10000,
});

// Add request interceptor
api.interceptors.request.use(
  config => {
    // Add auth token to all requests if available
    const token = localStorage.getItem('token');
    if (token) {
      // Use Authorization header instead of custom headers to avoid CORS issues
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

// Refresh token logic
const refreshAuthLogic = failedRequest => {
  // Skip refresh for login and register endpoints
  const url = failedRequest.response?.config?.url;
  if (url && (url.includes('/api/auth/login') || url.includes('/api/auth/register'))) {
    return Promise.reject(failedRequest);
  }

  return api.post('/api/auth/refresh-token')
    .then(response => {
      // Token is now refreshed in HttpOnly cookie automatically
      return Promise.resolve();
    })
    .catch(error => {
      // If refresh fails, redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    });
};

// Add refresh interceptor
createAuthRefreshInterceptor(api, refreshAuthLogic, {
  statusCodes: [401], // Only trigger on 401 responses
  skipWhileRefreshing: true // Don't intercept requests while refreshing
});

// Get CSRF token for state-changing operations
export const getCsrfToken = async () => {
  try {
    const response = await api.get('/api/csrf-token');
    return response.data.csrfToken;
  } catch (error) {
    return null;
  }
};

// Auth endpoints
export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  try {
    // Validate input data first
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user data provided');
    }

    // Validate username
    if (!userData.username || typeof userData.username !== 'string') {
      throw new Error('Username is required');
    }

    const trimmedUsername = userData.username.trim();
    if (trimmedUsername === '') {
      throw new Error('Username cannot be empty');
    }

    // Validate email
    if (!userData.email || typeof userData.email !== 'string') {
      throw new Error('Email is required');
    }

    const trimmedEmail = userData.email.trim();
    if (trimmedEmail === '') {
      throw new Error('Email cannot be empty');
    }

    // Validate password
    if (!userData.password || typeof userData.password !== 'string') {
      throw new Error('Password is required');
    }

    // Create a clean object with the correct field names for the server
    const cleanUserData = {
      name: trimmedUsername,     // Map username to name as expected by the server
      email: trimmedEmail,
      password: userData.password
    };

    // Prepare data for API call

    // Make the API call to the auth endpoint which has validation middleware
    const response = await api.post('/api/auth/register', cleanUserData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

export const checkAuthStatus = async () => {
  try {
    const response = await api.get('/api/users/profile');
    return { isAuthenticated: true, user: response.data };
  } catch (error) {
    // Don't trigger the refresh token logic for auth checks
    return { isAuthenticated: false, user: null };
  }
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
export const fetchEvents = async (showArchived = false) => {
  try {
    // Make the request - auth token will be added by the request interceptor
    const config = {
      params: { showArchived: showArchived }
    };

    const response = await api.get('/api/events', config);

    // Process the response data to handle any encoding issues
    const processedData = response.data.map(event => ({
      ...event,
      title: event.title,
      location: event.location,
      group: event.group
    }));

    return processedData;
  } catch (error) {
    // Return an empty array if error is encountered
    return [];
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    // Auth token will be added by the request interceptor
    const response = await api.delete(`/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    // Format the error message for better display
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.response && error.response.status === 403) {
      throw new Error('You are not authorized to delete this event');
    } else if (error.response && error.response.status === 401) {
      throw new Error('You must be logged in to delete events');
    } else {
      throw new Error('Failed to delete event');
    }
  }
};

// Upload an event image and return the image path for Billboard
export const uploadEventImage = async (imageFile) => {
  try {
    // If no image, return null
    if (!imageFile) {
      return null;
    }

    // Create a FormData object for the image only
    const formData = new FormData();
    formData.append('image', imageFile);

    // Upload the image - auth token will be added by the request interceptor
    const response = await api.post('/api/events/upload-image', formData, {
      timeout: 30000
    });

    return response.data.imagePath;
  } catch (error) {
    throw new Error('Failed to upload image: ' + (error.response?.data?.message || error.message));
  }
};

// Create a new event with separate image upload
export const createEvent = async (eventData) => {
  try {

    // Extract the image file from the FormData
    let imageFile = null;
    for (let [key, value] of eventData.entries()) {
      if (key === 'image' && value instanceof File) {
        imageFile = value;
        break;
      }
    }

    // Convert FormData to a regular object
    const eventDataObj = {};
    for (let [key, value] of eventData.entries()) {
      if (key === 'image' && value instanceof File) continue;

      // Special cases
      if (key === 'size') {
        eventDataObj[key] = JSON.parse(value);
      } else if (key === 'urgent') {
        eventDataObj[key] = value === 'true';
      } else if (typeof value === 'string') {
        // Special characters in string sanitization
        if (key === 'title' || key === 'location' || key === 'group') {
          // These fields might contain special characters that need to be preserved
          eventDataObj[key] = value;
        } else {
          eventDataObj[key] = value;
        }
      } else {
        eventDataObj[key] = value;
      }
    }

    // Upload the image first if it exists
    let imagePath = null;
    if (imageFile) {
      imagePath = await uploadEventImage(imageFile);
    }

    // Add the image path to the event data
    if (imagePath) {
      eventDataObj.image = imagePath;
    }

    // Create the event with JSON data - auth token will be added by the request interceptor
    const response = await api.post('/api/events', eventDataObj, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message || 'Server error';
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request
      throw new Error('Failed to create event: ' + error.message);
    }
  }
};

// Added Event limit check to prevent spam (This is not a good security measure but works for now)
export const checkDailyEventLimit = async () => {
  try {
    const response = await api.get('/api/events/check-limit');
    return response.data;
  } catch (error) {
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

    // Add retry logic for network errors
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        // Use the axios instance instead of fetch
        // The auth token will be added by the request interceptor
        const response = await api.get(url, {
          timeout: 5000 // 5 second timeout
        });

        // Validate the response data
        if (!Array.isArray(response.data)) {
          // If the response is not an array, return an empty array
          return [];
        }

        return response.data;
      } catch (err) {
        lastError = err;
        // Only retry on network errors or 5xx server errors
        if (!err.response || (err.response && err.response.status >= 500)) {
          retries--;
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Don't retry for client errors (4xx)
          break;
        }
      }
    }

    // For network errors, return empty array instead of throwing
    if (!lastError.response) {
      return [];
    }

    throw lastError;
  } catch (error) {
    // Return empty array for any other errors
    return [];
  }
};

export const fetchThreadById = async (id, _isRefresh = false) => {
  try {
    // Check if id is valid before making the API call
    if (!id) {
      throw new Error('Invalid thread ID');
    }

    const config = {
      timeout: 5000 // 5 second timeout
    };

    // Add retry logic for network errors
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        const response = await api.get(`/api/forum/${id}`, config);
        return response.data;
      } catch (err) {
        lastError = err;
        // Only retry on network errors or 5xx server errors
        if (!err.response || (err.response && err.response.status >= 500)) {
          retries--;
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Don't retry for client errors (4xx)
          break;
        }
      }
    }

    // Error handling if all retries failed
    throw lastError;
  } catch (error) {
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

// Upload a resource file and return the file path
export const uploadResourceFile = async (file) => {
  try {
    console.log('Uploading resource file:', file ? file.name : 'No file');

    // If no file, return null
    if (!file) {
      return null;
    }

    // Create a FormData object for the file only
    const formData = new FormData();
    formData.append('file', file);

    // Upload the file - auth token will be added by the request interceptor
    const response = await api.post('/api/resources/upload-file', formData, {
      timeout: 30000
    });

    console.log('File uploaded successfully:', response.data);
    return response.data.filePath;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file: ' + (error.response?.data?.message || error.message));
  }
};

// Create a resource with separate file upload
export const createResource = async (resourceData) => {
  try {
    console.log('Creating resource with data:', resourceData);

    // Extract the file from the FormData
    let resourceFile = null;
    for (let [key, value] of resourceData.entries()) {
      if (key === 'file' && value instanceof File) {
        resourceFile = value;
        break;
      }
    }

    // Convert FormData to a regular object
    const resourceDataObj = {};
    for (let [key, value] of resourceData.entries()) {
      // Skip the file - we'll handle it separately
      if (key === 'file' && value instanceof File) continue;

      resourceDataObj[key] = value;
    }

    // Upload the file first if it exists
    let filePath = null;
    if (resourceFile) {
      filePath = await uploadResourceFile(resourceFile);
      console.log('File uploaded, path:', filePath);
    }

    // Add the file path to the resource data
    if (filePath) {
      resourceDataObj.filePath = filePath;
    }

    console.log('Sending resource data to server:', resourceDataObj);

    // Create the resource with JSON data - auth token will be added by the request interceptor
    const response = await api.post('/api/resources', resourceDataObj, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Failed to create resource: ' + error.message);
    }
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
  // This will trigger a file download
  window.open(`${api.defaults.baseURL}/api/resources/${id}/download`, '_blank');
};

export const fetchUserResources = async (userId = null) => {
  const url = userId ? `/api/resources/user/${userId}` : '/api/resources/user';
  const response = await api.get(url);
  return response.data;
};

export default api;
