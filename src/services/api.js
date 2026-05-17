import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to automatically attach authorization headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to format API errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else {
        errorMessage = `Request failed with status code ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from server. Please check your connection or backend server status.';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
