// src/services/apiClient.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject the token into each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Use localStorage to store the token in React
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generic error handling for responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Here you can handle specific error codes like 401 to log out the user
    // if (error.response?.status === 401) { ... }
    return Promise.reject(error);
  }
);

export default api;
