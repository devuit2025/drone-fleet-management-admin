// /src/api/axios.ts
import { toastError } from '@/lib/toast';
import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(config => {
    // Attach token from store (persisted as 'access_token'); support legacy 'accessToken'
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    response => response.data,
    error => {
        console.error('[API Error]', error);
        throw error.response?.data || error;
    },
);

api.interceptors.response.use(
    (response) => response,
    error => {
      console.error("[API Error]", error);
  
      const message = error.response?.data?.message || error.message || "Something went wrong";
  
      toastError(message);
  
      // Return a structured object instead of throwing raw error
      return Promise.reject({
        message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  );
  