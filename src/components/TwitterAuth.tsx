// src/components/TwitterAuth.tsx
import React, { useState } from 'react';
import { useTwitterBearer } from '../hooks/useTwitterBearer';

const TwitterAuth: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const { loading, error, bearerToken, getBearerToken } = useTwitterBearer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await getBearerToken(apiKey, apiSecret);
  };

  return (
    <div>
      <h2>Obtener Bearer Token de Twitter</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>API Key:</label>
          <input
            type="text"
            className='border'
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div>
          <label>API Secret:</label>
          <input
            type="text"
            className='border'
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className='border'>
          {loading ? 'Obteniendo token...' : 'Obtener Token'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {bearerToken && (
        <div>
          <p><strong>Bearer Token:</strong></p>
          <code>{bearerToken}</code>
        </div>
      )}
    </div>
  );
};

export default TwitterAuth;
