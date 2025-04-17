// src/hooks/useCharacters.ts
import { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { AgentOverview, FeaturedCharactersResponse } from '../types'; // Assuming `Agent` and `Pagination` types are declared in `types`

export function useFeaturedAgents() {
  const [agents, setAgents] = useState<AgentOverview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedAgents = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await api.get<FeaturedCharactersResponse>('/character/featured', {
        //params: { page, per_page: perPage },
      });

      setAgents(response.data.data);
    } catch (err) {
      setError('Failed to fetch characters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedAgents();
  }, []);

  return { agents, loading, error, refetch: fetchFeaturedAgents };
}
