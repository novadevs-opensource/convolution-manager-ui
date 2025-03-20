// src/context/AuthContext.tsx
import React, { createContext, useState, useMemo } from 'react';
import { getUserProfile } from '../services/authService'; // Asegúrate de importar tu servicio
import { WalletService } from '../services/web3/walletService';
import { ApiKeyService } from '../services/apiKeyService';

// 1. Definir tipo de contexto
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  userProfile: any; // Definimos el tipo de usuario que vas a manejar
  login: (token: string) => void;
  logout: () => void;
  loadUserProfile: () => void;
}

// 2. Crear el contexto
export const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  userProfile: null,
  login: () => {},
  logout: () => {},
  loadUserProfile: () => {}, // Agregamos la función de carga del perfil
});

/**
 * Proveedor del contexto Auth para envolver la app
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState<any>(null); // Estado para el perfil del usuario

  // Función para cargar el perfil del usuario
  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    }
  };

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken); // Persistir en localStorage
    loadUserProfile(); // Cargar perfil después de login
  };

  const logout = () => {
    setToken(null);
    setUserProfile(null); // Limpiar el perfil al cerrar sesión
    localStorage.removeItem('token');
    // Remove openrouter api key from local storage
    const apiKeyService = ApiKeyService.getInstance();
    apiKeyService.removeApiKey();
    // Remove wallet key from local storage
    const walletService = WalletService.getInstance()
    walletService.removeWalletAddr()
  };

  const value = useMemo(() => ({
    token,
    isAuthenticated: !!token,
    userProfile, // Añadimos el perfil al contexto
    login,
    logout,
    loadUserProfile,
  }), [token, userProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
