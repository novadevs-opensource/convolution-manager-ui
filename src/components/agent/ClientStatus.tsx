// src/components/ClientStatus.tsx
import React from 'react';
import { FaRegCircle, FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import { Client } from '../../types'; // Asegúrate de importar el tipo Client

// Definimos los requisitos de cada cliente
interface ClientRequirements {
  [key: string]: (character: any) => boolean;
}

// Interface para las props del componente
interface ClientStatusProps {
  character: any; // Cambia esto por el tipo exacto que uses para el character
}

const ClientStatus: React.FC<ClientStatusProps> = ({ character }) => {
  // Mapeo de nombres para mostrar
  const clientDisplayNames: Record<Client, string> = {
    telegram: 'Telegram',
    twitter: 'X (Twitter)',
    discord: 'Discord',
    direct: 'Direct',
    farcaster: 'Farcaster'
  };

  // Validaciones específicas para cada cliente
  const clientRequirements: ClientRequirements = {
    telegram: (char) => !!char.definition.settings.secrets.TELEGRAM_BOT_TOKEN,
    twitter: (char) => (
      !!char.definition.settings.secrets.TWITTER_EMAIL && 
      !!char.definition.settings.secrets.TWITTER_PASSWORD &&
      !!char.definition.settings.secrets.TWITTER_USERNAME
    ),
    discord: (char) => !!char.definition.settings.secrets.DISCORD_BOT_TOKEN,
    direct: (char) => char, // Direct no requiere validaciones específicas
    farcaster: (char) => (
      !!char.definition.settings.secrets.FARCASTER_API_KEY &&
      !!char.definition.settings.secrets.FARCASTER_SECRET_KEY
    )
  };

  // Determina el estado de un cliente
  const getClientStatus = (client: Client) => {
    // Verifica si el cliente está incluido
    if (!character?.definition.clients.includes(client)) {
      return {
        active: false,
        configured: false,
        icon: <FaRegCircle />,
        color: 'text-black-light'
      };
    }

    // Verifica la configuración específica del cliente
    const isConfigured = clientRequirements[client]?.(character) || false;
    
    return {
      active: true,
      configured: isConfigured,
      icon: isConfigured ? <FaRegCheckCircle /> : <FaRegTimesCircle />,
      color: isConfigured ? 'text-green-500' : 'text-red-500'
    };
  };

  // Lista de clientes para renderizar
  const clientsToRender: Client[] = ['telegram', 'twitter', 'discord', 'direct', 'farcaster'];

  return (
    <div className='grid grid-cols-2 gap-2'>
      {clientsToRender.map((client) => {
        const status = getClientStatus(client);
        
        return (
          <div 
            key={client}
            className='sm:p-4 p-2 border-gray-200 border rounded-lg flex flex-row items-center justify-between'
          >
            <span className='text-sm font-bold text-black-light uppercase'>
              {clientDisplayNames[client]}
            </span>
            <span className={status.color}>
              {status.icon}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ClientStatus;