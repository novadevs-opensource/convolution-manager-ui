// src/hooks/useCharacters.ts
import { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { Agent, CharactersResponse, Pagination } from '../types'; // Assuming `Agent` and `Pagination` types are declared in `types`

export function useCharacters(page: number = 1, perPage: number = 100) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>();

  const fetchAgents = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await api.get<CharactersResponse>('/character', {
        params: { page, per_page: perPage },
      });

      setAgents(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        first_page_url: response.data.first_page_url,
        from: response.data.from,
        last_page: response.data.last_page,
        last_page_url: response.data.last_page_url,
        links: response.data.links,
        next_page_url: response.data.next_page_url,
        per_page: response.data.per_page,
        prev_page_url: response.data.prev_page_url,
        to: response.data.to,
        total: response.data.total,
      });
    } catch (err) {
      setError('Failed to fetch characters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page, perPage]);

  return { agents, loading, error, pagination, refetch: fetchAgents };
}
