import { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { Agent } from '../types';
import { ApiKeyService } from '../services/apiKeyService';
import axios from 'axios';

export interface CreditsResponseInterface {
  data: Data;
}

export interface Data {
  total_credits: number;
  total_usage: number;
}

export function useLLMProviderApiKey() {
  const apiKeyService = ApiKeyService.getInstance();
  // Initialize state with the API key from localStorage
  const [character, setCharacter] = useState<Agent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(apiKeyService.getApiKey());
  const [creditsData, setCreditsData] = useState<CreditsResponseInterface | undefined>(undefined);
  const [response, setResponse] = useState<any>(); // TODO: create interface

  // Automatically fetch credits data if an API key exists,
  // so that we have the credits balance without needing to update the API key.
  useEffect(() => {
    if (key) {
      (async () => {
        try {
          const { data } = await axios.get(`https://openrouter.ai/api/v1/credits`, {
            headers: {
              "Authorization": `Bearer ${key}`,
            },
          });
          setCreditsData(data);
        } catch (err) {
          console.error('Failed to fetch credits data:', err);
          setError('Failed to fetch credits data');
        }
      })();
    } else {
      setCreditsData(undefined);
    }
  }, [key]);

  // Validate the provided API key by fetching credits from the external service.
  // Returns true if the key is valid, false otherwise.
  const validateKey = async (newKey: string): Promise<boolean> => {
    try {
      const { data } = await axios.get(`https://openrouter.ai/api/v1/credits`, {
        headers: {
          "Authorization": `Bearer ${newKey}`,
        },
      });
      // Save the credits data to state
      setCreditsData(data);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Update the API key on the backend and synchronize it with localStorage.
  const updateLLMProviderApiKey = async (newKey: string) => {
    setLoading(true);
    setError(null);

    // First, validate the new key.
    const isValid = await validateKey(newKey);
    if (!isValid) {
      setError('Invalid API key');
      setLoading(false);
      return;
    }

    try {
      // Call the backend endpoint to update the user's API key.
      // The endpoint expects the new API key in the request body.
      const { data } = await api.put(`/user/api-key`, { llm_provider_api_key: newKey });
      setResponse(data);
      // Update the character state based on the response (if applicable)
      setCharacter(data.character);
      // Save the new API key to localStorage via the ApiKeyService.
      apiKeyService.saveApiKey(newKey);
      setKey(newKey);
    } catch (err) {
      console.error(err);
      setError('Failed to update API key');
    } finally {
      setLoading(false);
    }
  };

  // Remove the existing API key from both localStorage and state.
  const removeApiKey = async () => {
    setLoading(true);
    setError(null);

    try {
      // Optionally, you could call a backend endpoint here to remove the API key.
      // For now, we remove it locally.
      apiKeyService.removeApiKey();
      setKey(null);
      setCreditsData(undefined);
      const { data } = await api.put(`/user/api-key`, { llm_provider_api_key: null });
      // Update the character state based on the response (if applicable)
      setCharacter(data.character);
      setResponse({message: "API key removed successfully"});
    } catch (err) {
      console.error(err);
      setError('Failed to remove API key');
    } finally {
      setLoading(false);
    }
  };

  return { character, loading, error, updateResponse: response, updateHandler: updateLLMProviderApiKey, removeHandler: removeApiKey, key, creditsData };
}
