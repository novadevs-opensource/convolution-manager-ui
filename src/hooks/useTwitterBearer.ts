// src/hooks/useTwitterBearer.ts
import { useState, useCallback } from 'react';
import axios from 'axios';

export interface TwitterBearerResponse {
  token_type: string;
  access_token: string;
}

export function useTwitterBearer() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bearerToken, setBearerToken] = useState<string | null>(null);

  const getBearerToken = useCallback(async (apiKey: string, apiSecret: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Combina las credenciales y codifícalas en Base64
      const credentials = `${apiKey}:${apiSecret}`;
      const encodedCredentials = btoa(credentials);

      const response = await axios.post<TwitterBearerResponse>(
        'https://api.twitter.com/oauth2/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
        }
      );
      console.log(response);
      setBearerToken(response.data.access_token);
    } catch (err: any) {
      console.error('Error obteniendo el bearer token de Twitter:', err);
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Error obteniendo el bearer token');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, bearerToken, getBearerToken };
}
