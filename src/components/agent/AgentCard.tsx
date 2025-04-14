// src/components/agent/AgentCard.tsx
import React from 'react';
import { Agent, Client } from '../../types';
import { Link } from 'react-router-dom';
import AgentStatus from './AgentStatus';

// Helper function to render client icons
export const renderClientBadges = (clients: Client[]) => {
  const clientIcons: Record<Client, {icon: string, iconPrefix: string, bgColor: string, hoverBgColor: string, textColor: string, hoverTextColor: string}> = {
    discord: {
      icon: 'discord', 
      iconPrefix: 'fa-brands',
      bgColor: 'bg-orange-400', 
      hoverBgColor: 'hover:bg-indigo-600',
      textColor: 'text-white',
      hoverTextColor: 'hover:text-white'
    },
    direct: {
      icon: 'message', 
      iconPrefix: 'fa-solid',
      bgColor: 'bg-orange-400', 
      hoverBgColor: 'hover:bg-blue-600',
      textColor: 'text-white',
      hoverTextColor: 'hover:text-white'
    },
    twitter: {
      icon: 'twitter', 
      iconPrefix: 'fa-brands',
      bgColor: 'bg-orange-400',
      hoverBgColor: 'hover:bg-sky-600',
      textColor: 'text-white',
      hoverTextColor: 'hover:text-white'
    },
    telegram: {
      icon: 'telegram', 
      iconPrefix: 'fa-brands',
      bgColor: 'bg-orange-400',
      hoverBgColor: 'hover:bg-cyan-600',
      textColor: 'text-white',
      hoverTextColor: 'hover:text-white'
    },
    farcaster: {
      icon: 'podcast', 
      iconPrefix: 'fa-solid',
      bgColor: 'bg-orange-400', 
      hoverBgColor: 'hover:bg-purple-600',
      textColor: 'text-white',
      hoverTextColor: 'hover:text-white'
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {clients.map((client, index) => {
        const clientConfig = clientIcons[client];
        return (
          <div 
            key={`client-${index}`} 
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 
              ${clientConfig.bgColor} ${clientConfig.textColor} 
              ${clientConfig.hoverBgColor} ${clientConfig.hoverTextColor}
              shadow-sm hover:shadow-md cursor-pointer`}
            title={client.charAt(0).toUpperCase() + client.slice(1)}
          >
            <i className={`${clientConfig.iconPrefix} fa-${clientConfig.icon}`}></i>
          </div>
        );
      })}
    </div>
  );
};

interface AgentCardProps {
  agent: Agent;
  cardKey: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, cardKey }) => {
  const bioText = agent.definition.bio && agent.definition.bio.length > 0 
    ? agent.definition.bio.join('.\n')
    : 'No bio available';
  
  return (
    <div 
      key={cardKey} 
      className="bg-white rounded-lg border border-orange-100 overflow-hidden mb-6"
    >
      <Link to={`/agent/${agent.id}`}>
        {/* Card header with image */}
        <div className={`relative p-9 bg-beige-200`}>
          {agent.face_image_path ? (
            <img 
              className='rounded rounded-full h-20 w-20 hover:opacity-60 absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 transition-transform duration-300 hover:scale-105 object-cover'
              src={`${import.meta.env.VITE_AVATAR_BUCKET_BASE_URL}/${agent.face_image_path}`}
            />
          ) : (
            <div className='h-20 w-20 bg-white rounded rounded-full p-2 border hover:opacity-60 items-center justify-center flex absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 transition-transform duration-300 hover:scale-105 object-cover'>
              <i className='fa fa-user fa-2x'></i>
            </div>
          )}
          <AgentStatus id={agent?.id!} className='absolute top-2 right-2 px-2'/>
        </div>
        {/* Card content */}
        <div className='bg-yellow-50 p-4'>
          <div className='flex flex-row justify-between mb-2'>
            {renderClientBadges(agent.definition.clients)}
          </div>
          <div className='flex flex-row items-center justify-between gap-2'>
            {/* LLM */}
            <div className='flex flex-row items-center gap-2 font-semibold'>
              <div className={`w-8 h-8 p-2 rounded-full flex items-center justify-center bg-blue-500 text-white shadow-sm`}>
                <i className="fa fa-brain"></i>
              </div>
              <span className="font-anek-latin font-light">
                {agent.definition.settings.secrets.OPENROUTER_MODEL?.split('/')[1]}
              </span>
            </div>
          </div>
          
          <div className="mt-6 text-center font-black">
            <span className='text-2xl font-anek-latin font-bold'>
                {agent.definition.name}
            </span>
            
            <p className="mb-4 font-thin">{bioText.length > 250 ? `${bioText.substring(0, 250)}...` : bioText}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AgentCard;