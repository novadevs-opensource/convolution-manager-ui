// src/components/ClientStatus.tsx
import React from 'react';
import { FaRegTimesCircle, FaCircle } from "react-icons/fa";
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
        icon: <FaCircle />,
        color: 'text-slate-500',
        text: 'Inactive',
        bg: 'bg-slate-200'
      };
    }

    // Verifica la configuración específica del cliente
    const isConfigured = clientRequirements[client]?.(character) || false;
    console.log(client);
    return {
      active: true,
      configured: isConfigured,
      icon: isConfigured ? <FaCircle /> : <FaRegTimesCircle />,
      color: isConfigured ? 'text-green-500' : 'text-red-500',
      bg: isConfigured ? 'bg-green-200' : 'bg-red-200',
      text: isConfigured ? 'Active' : 'Not configured'
    };
  };

  // Lista de clientes para renderizar
  const clientsToRender: Client[] = ['telegram', 'twitter'];

  return (
    <div className='flex flex-col gap-2'>
      {clientsToRender.map((client) => {
        const status = getClientStatus(client);
        
        return (
          <div 
            key={client}
            className='sm:p-4 p-2 bg-beige-200 rounded-lg flex flex-row items-center justify-between font-anek-latin'
          >
            <div className='flex flex-row items-center gap-2'>
              <i className={`fa-brands fa-xl fa-${client} text-orange-500`}></i>
              <span className='text-black'>
                {clientDisplayNames[client]}
              </span>
            </div>
            <div className={`${status.color} ${status.bg} rounded-xl px-2 pr-3 py-1 flex flex-row items-center justify-between gap-2 text-xs`}>
              {status.icon} <span className='text-black font-semibold'>{status.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClientStatus;