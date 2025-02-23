// src/hooks/useCharacter.ts
import { useState } from 'react';
import api from '../services/apiClient';
import { CharacterData } from '../types';

export function useAgent() {
  const [response, setResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const saveCharacter = async (userId: string, llm_provider_model: string, llm_provider_api_key: string, definition: CharacterData) => {
    setLoading(true);
    setError(null);
    try {
      let payload = {
        "user_id": userId,
        "llm_provider_name": "openrouter",
        "llm_provider_model": llm_provider_model,
        "llm_provider_api_key": llm_provider_api_key,
        "definition": JSON.stringify(definition),
      }
      const { data } = await api.post('/character', payload);
      setResponse(data);
    } catch (err) {
      setError('Failed to fetch character details');
    } finally {
      setLoading(false);
    }
  };

  const updateCharacter = async (agentId: string, llm_provider_model: string, llm_provider_api_key: string, definition: CharacterData) => {
    setLoading(true);
    setError(null);
    try {
      let payload = {
        "agent_id": agentId,
        "llm_provider_name": "openrouter",
        "llm_provider_model": llm_provider_model,
        "llm_provider_api_key": llm_provider_api_key,
        "definition": JSON.stringify(definition),
      }
      const { data } = await api.put('/character', payload);
      setResponse(data);
      console.log(data);
    } catch (err) {
      setError('Failed to fetch character details');
    } finally {
      setLoading(false);
    }
  };

  return { response, loading, error, saveHandler: saveCharacter, updateHandler: updateCharacter };
}
