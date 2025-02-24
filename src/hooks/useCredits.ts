// src/hooks/useCharacter.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ApiKeyService } from '../services/apiKeyService';

export function useCredits() {
  const apiKeyService = ApiKeyService.getInstance();
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [totalUsage, setTotalUsage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`https://openrouter.ai/api/v1/credits`, {
        headers: {
          "Authorization": `Bearer ${apiKeyService.getApiKey()}`
        },
      });
      setTotalCredits(data.data.total_credits);
      setTotalUsage(data.data.total_usage);
    } catch (err) {
      console.error(err)
      setError('Failed to fetch credits balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return { totalCredits, totalUsage, loading, error, refetch: fetchCredits };
}