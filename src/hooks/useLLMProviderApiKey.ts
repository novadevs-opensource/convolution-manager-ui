// src/hooks/useLLMProviderApiKey.ts
import { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { Agent } from '../types';
import { API_KEY_STORAGE_KEY } from '../constants';

export function useLLMProviderApiKey(id: string) {
  const [character, setCharacter] = useState<Agent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateLLMProviderApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/user/api-key`, {llm_provider_api_key: localStorage.getItem(API_KEY_STORAGE_KEY)});
      setCharacter(data.character);
      console.log(data);
    } catch (err) {
      setError('Failed to fetch character details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) updateLLMProviderApiKey();
  }, [id]);

  return { character, loading, error, handler: updateLLMProviderApiKey };
}
