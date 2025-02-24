// src/services/authService.ts
import api from './apiClient';
import { ApiKeyService } from './apiKeyService';

export const loginService = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password });
  if (response.data.llm_provider_api_key) {
    const apiKeyService = ApiKeyService.getInstance();
    apiKeyService.saveApiKey(response.data.llm_provider_api_key);
  }
  return response.data.token;
};

export const registerService = async (name:string, email: string, password: string, password_confirmation: string) => {
  const response = await api.post('/register', { name, email, password, password_confirmation });

  return response.data.token;
};

export const logoutService = async () => {
  await api.post('/logout');
};

export const getUserProfile = async () => {
  const response = await api.get('/user');
  return response.data;
};
