// src/components/characterEditor/ClientToggles.tsx
import React from 'react';
import { Client } from '../../types';

interface ClientTogglesProps {
  availableClients: Client[];
  selectedClients: Client[];
  onChange: (selected: Client[]) => void;
}

const ClientToggles: React.FC<ClientTogglesProps> = ({ availableClients, selectedClients, onChange }) => {
  const toggleClient = (client: Client) => {
    const newSelected = selectedClients.includes(client)
      ? selectedClients.filter(c => c !== client)
      : [...selectedClients, client];
    onChange(newSelected);
  };

  return (
    <div className="client-toggles">
      {availableClients.map(client => (
        <button
          key={client}
          className={`client-toggle ${selectedClients?.includes(client) ? 'active' : ''}`}
          onClick={() => toggleClient(client)}
          data-client={client}
        >
          {client.charAt(0).toUpperCase() + client.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default ClientToggles;
