import React from 'react';
import { Agent, Client } from '../../types';
import { Link } from 'react-router-dom';
import AgentStatus from './AgentStatus';


interface AgentCardAgentProps {
  agent: Agent;
}

const clientIcons: Record<Client, {
  icon: string;
  iconPrefix: string;
  bgColor: string;
  hoverBgColor: string;
  textColor: string;
  hoverTextColor: string;
}> = {
  discord: {
    icon: 'discord',
    iconPrefix: 'fa-brands',
    bgColor: 'bg-orange-400',
    hoverBgColor: 'hover:bg-indigo-600',
    textColor: 'text-white',
    hoverTextColor: 'hover:text-white',
  },
  direct: {
    icon: 'message',
    iconPrefix: 'fa-solid',
    bgColor: 'bg-orange-400',
    hoverBgColor: 'hover:bg-blue-600',
    textColor: 'text-white',
    hoverTextColor: 'hover:text-white',
  },
  twitter: {
    icon: 'x-twitter',
    iconPrefix: 'fa-brands',
    bgColor: 'bg-orange-400',
    hoverBgColor: 'hover:bg-black',
    textColor: 'text-white',
    hoverTextColor: 'hover:text-white',
  },
  telegram: {
    icon: 'telegram',
    iconPrefix: 'fa-brands',
    bgColor: 'bg-orange-400',
    hoverBgColor: 'hover:bg-cyan-600',
    textColor: 'text-white',
    hoverTextColor: 'hover:text-white',
  },
  farcaster: {
    icon: 'podcast',
    iconPrefix: 'fa-solid',
    bgColor: 'bg-orange-400',
    hoverBgColor: 'hover:bg-purple-600',
    textColor: 'text-white',
    hoverTextColor: 'hover:text-white',
  },
};

export const renderClientBadges = (clients: Client[]) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {clients.map((client, index) => {
        const config = clientIcons[client];

        return (
          <div
            key={`client-${index}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 
              ${config.bgColor} ${config.textColor} 
              ${config.hoverBgColor} ${config.hoverTextColor}
              shadow-sm hover:shadow-md cursor-pointer`}
            title={client.charAt(0).toUpperCase() + client.slice(1)}
          >
            <i className={`${config.iconPrefix} fa-${config.icon}`}></i>
          </div>
        );
      })}
    </div>
  );
};

const AgentCardAgent: React.FC<AgentCardAgentProps> = ({ agent }) => {
  const bioText = agent.definition.bio?.length > 0
    ? agent.definition.bio.join('.\n')
    : 'No bio available';


  return (
    <div className="bg-white rounded-lg overflow-hidden mb-6">
      <Link to={`/agent/${agent.id}`}>
        {/* Card header */}
        <div className="relative p-9 bg-beige-200">
          <div className="absolute flex flex-row justify-between top-2 left-4">
            {renderClientBadges(agent.definition.clients)}
          </div>
          {agent.face_image_path ? (
            <img
              className="rounded-full h-20 w-20 absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 border-4 border-white dark:border-gray-800 transition-transform duration-300 hover:scale-105 object-cover"
              src={`${import.meta.env.VITE_AVATAR_BUCKET_BASE_URL}/${agent.face_image_path}`}
            />
          ) : (
            <div className="h-20 w-20 bg-white rounded-full p-2 border items-center justify-center flex absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 border-4 border-white dark:border-gray-800 transition-transform duration-300 hover:scale-105 object-cover">
              <i className="fa fa-user fa-2x"></i>
            </div>
          )}
          <AgentStatus id={agent.id} className="absolute top-2 right-4 px-2" />
        </div>

        {/* Card content */}
        <div className="bg-yellow-50 p-4 pt-14">
          <div className="flex flex-col items-center justify-between gap-2">
            <span className="text-2xl font-anek-latin font-bold text-center">
              {agent.definition.name}
            </span>

            <div className="flex flex-row items-center gap-2 font-semibold w-full">
              <div className="w-8 h-8 p-2 rounded-full flex items-center justify-center bg-orange-300 text-white shadow-sm">
                <i className="fa fa-brain"></i>
              </div>
              <span className="font-anek-latin font-light">
                {agent.definition.settings.secrets.OPENROUTER_MODEL?.split('/')[1]}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center font-black">
            <p className="mb-4 font-thin">
              {bioText.length > 250 ? `${bioText.substring(0, 250)}...` : bioText}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AgentCardAgent;
