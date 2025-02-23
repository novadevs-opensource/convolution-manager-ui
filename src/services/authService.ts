// src/services/authService.ts
import { API_KEY_STORAGE_KEY } from '../constants';
import api from './apiClient';

export const loginService = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password });
  if (response.data.llm_provider_api_key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, response.data.llm_provider_api_key);
  }
  return response.data.token; // Solo devolvemos el token
};

export const logoutService = async () => {
  await api.post('/logout');
};

export const getUserProfile = async () => {
  const response = await api.get('/user');
  return response.data;
};
