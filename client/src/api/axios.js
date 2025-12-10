import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // Make sure this matches your server port

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Or however you retrieve it
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${BASE_URL}/refresh`, { token: refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('accessToken', accessToken); // Optional: if using LS for access token
        
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - Clear tokens
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');

        // PREVENT INFINITE LOOP: Only redirect if we are NOT already at login
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Also save to LS so it persists on refresh (optional but recommended for this assignment)
        localStorage.setItem('accessToken', token); 
    } else {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('accessToken');
    }
};

export default api;