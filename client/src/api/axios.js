import axios from 'axios';

// CHANGE THIS to your actual deployed backend URL
const BASE_URL = 'https://jwt-api-qi2a.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- CONCURRENCY LOCK ---
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
// ------------------------

// 1. Request Interceptor: Attach Token (Memory)
api.interceptors.request.use(
  (config) => {
    // If we have a token in memory (set via setAuthToken), use it.
    // (We access the common header directly to simulate "memory" storage)
    const token = api.defaults.headers.common['Authorization'];
    if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Refresh Logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // CASE 1: A refresh is ALREADY happening. Queue this request.
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      // CASE 2: No refresh happening. Start the refresh.
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${BASE_URL}/refresh`, { token: refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Save new Refresh Token
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Save new Access Token (Memory/Headers)
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Process the queue of waiting requests
        processQueue(null, accessToken);
        
        // Return the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed (Logged out)
        processQueue(refreshError, null);
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        
        // Only redirect if valid logout
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper to set token manually (on Login)
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;