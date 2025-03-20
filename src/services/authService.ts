// src/services/authService.ts
import api from './apiClient';
import { ApiKeyService } from './apiKeyService';
import { WalletService } from './web3/walletService';

// loginService is not used because classic login form is temporary disabled 
export const loginService = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password });
  if (response.data.llm_provider_api_key) {
    const apiKeyService = ApiKeyService.getInstance();
    apiKeyService.saveApiKey(response.data.llm_provider_api_key);
  }
  if (response.data.wallet_address) {
    const walletService = WalletService.getInstance();
    walletService.saveWalletAddr(response.data.wallet_address);
  }
  return response.data.token;
};

export const registerService = async (name:string, email: string, password: string, password_confirmation: string) => {
  const response = await api.post('/register', { name, email, password, password_confirmation });

  return response.data.token;
};

export const getUserProfile = async () => {
  const response = await api.get('/user');
  return response.data;
};

export const loginWithWallet = async (walletAddress: string) => {
  const response = await api.post('/wallet-login', { wallet_address: walletAddress });
  if (response.data.llm_provider_api_key) {
    const apiKeyService = ApiKeyService.getInstance();
    apiKeyService.saveApiKey(response.data.llm_provider_api_key);
  }
  if (response.data.wallet_address) {
    const walletService = WalletService.getInstance();
    walletService.saveWalletAddr(response.data.wallet_address);
  }
  return response.data.token;
};