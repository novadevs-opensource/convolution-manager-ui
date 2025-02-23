// src/components/characterEditor/ClientToggles.tsx
import React from 'react';

interface ClientTogglesProps {
  availableClients: string[];
  selectedClients: string[];
  onChange: (selected: string[]) => void;
}

const ClientToggles: React.FC<ClientTogglesProps> = ({ availableClients, selectedClients, onChange }) => {
  const toggleClient = (client: string) => {
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
