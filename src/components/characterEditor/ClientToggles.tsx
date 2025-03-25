// src/components/characterEditor/ClientToggles.tsx
import React from 'react';
import { Client } from '../../types';

interface ClientTogglesProps {
  availableClients: Client[];
  selectedClients: Client[];
  onChange: (selected: Client[]) => void;
  label?: string;
}

const ClientToggles: React.FC<ClientTogglesProps> = ({ availableClients, selectedClients, onChange, label }) => {
  const toggleClient = (client: Client) => {
    const newSelected = selectedClients.includes(client)
      ? selectedClients.filter(c => c !== client)
      : [...selectedClients, client];
    onChange(newSelected);
  };

  return (
    <div className='flex flex-col'>
      {label && <label className='text-lg'>{label}</label>}
      <div className='flex flex-row gap-2'>
        {availableClients.map(client => (
          <button
            key={client}
            className={`client-toggle bg-gray-50 rounded-full active:bg-red px-6 py-2 text-base ${selectedClients?.includes(client) ? 'active' : ''}`}
            onClick={() => toggleClient(client)}
            data-client={client}
          >
            {client.charAt(0).toUpperCase() + client.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClientToggles;
