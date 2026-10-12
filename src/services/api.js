import axios from 'axios';
import { useAuthStore } from '@/store/store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9080/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to automatically attach authorization headers
api.interceptors.request.use(
  (config) => {
    // Read token directly from Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function formatError(error) {
  let errorMessage = 'An unexpected error occurred. Please try again.';

  if (error.response) {
    if (error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.response.data && typeof error.response.data === 'string') {
      errorMessage = error.response.data;
    } else {
      errorMessage = `Request failed with status code ${error.response.status}`;
    }
  } else if (error.request) {
    errorMessage = 'No response received from server. Please check your connection or backend server status.';
  } else {
    errorMessage = error.message;
  }

  return new Error(errorMessage);
}

// Response interceptor to handle token expiration & automatic refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and request has not been retried yet
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      const requestUrl = originalRequest.url || '';

      // Skip refresh attempt for auth endpoints (e.g., login, register, refresh itself)
      if (
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/refresh-token') ||
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/logout')
      ) {
        return Promise.reject(formatError(error));
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(formatError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9080/api/v1';

        // Call the refresh-token endpoint with cookies enabled
        const refreshRes = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        const newAuthData = refreshRes.data?.data;
        const newToken = newAuthData?.token;

        if (newToken) {
          useAuthStore.getState().setToken(newToken);
          if (newAuthData) {
            useAuthStore.getState().setUser(newAuthData);
          }
          if (typeof document !== 'undefined') {
            document.cookie = `delicious_token=${newToken}; path=/; max-age=604800; SameSite=Lax`;
            if (newAuthData?.role) {
              document.cookie = `delicious_role=${newAuthData.role}; path=/; max-age=604800; SameSite=Lax`;
            }
          }
        }

        processQueue(null, newToken);

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(formatError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formatError(error));
  }
);

export default api;
