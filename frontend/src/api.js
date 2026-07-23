import axios from 'axios';

const API_URL = 'http://localhost:5000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // Add this for CORS
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('API Interceptor - token:', token ? 'Found' : 'Not found');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('📡 API interceptor - response received:', response.status);
    return response;
  },
  (error) => {
    console.error('📡 API interceptor - error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;