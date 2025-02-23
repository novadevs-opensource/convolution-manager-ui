// src/hooks/useCharacter.ts
import { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { Agent } from '../types';

export function useCharacter(id: string) {
  const [character, setCharacter] = useState<Agent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacter = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/character/${id}`);
      setCharacter(data.character);
      console.log(data);
    } catch (err) {
      setError('Failed to fetch character details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCharacter();
  }, [id]);

  return { character, loading, error, refetch: fetchCharacter };
}
