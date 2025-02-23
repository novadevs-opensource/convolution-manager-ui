// src/hooks/useCharacters.ts
import { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { Agent, Pagination } from '../types'; // Assuming `Agent` and `Pagination` types are declared in `types`

interface CharactersResponse {
  current_page: number;
  data: Agent[];
  total: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export function useCharacters(page: number = 1, perPage: number = 10) {
  const [characters, setCharacters] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    total_pages: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  const fetchCharacters = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await api.get<CharactersResponse>('/character', {
        params: { page, per_page: perPage },
      });

      setCharacters(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        total_pages: response.data.last_page,
        next_page_url: response.data.next_page_url,
        prev_page_url: response.data.prev_page_url,
      });
    } catch (err) {
      setError('Failed to fetch characters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [page, perPage]);

  return { characters, loading, error, pagination, refetch: fetchCharacters };
}
