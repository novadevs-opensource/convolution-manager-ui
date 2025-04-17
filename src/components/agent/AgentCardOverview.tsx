import React from 'react';
import { AgentOverview, Client } from '../../types';

interface AgentCardOverviewProps {
  agent: AgentOverview;
}

const clientIcons: Record<Client, { icon: string; iconPrefix: string; bgColor: string; hoverBgColor: string; textColor: string; hoverTextColor: string }> = {
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

export const renderClientBadgesOverview = (clients: any[]) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {clients.map((client, index) => {
        const [type, data] = Object.entries(client)[0] as [Client, any];
        const config = clientIcons[type];
        const link =
          type === 'telegram'
            ? `${data.link}`
            : type === 'twitter'
            ? `${data.link}`
            : null;

        const badge = (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 
              ${config.bgColor} ${config.textColor} 
              ${config.hoverBgColor} ${config.hoverTextColor}
              shadow-sm hover:shadow-md cursor-pointer`}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
          >
            <i className={`${config.iconPrefix} fa-${config.icon}`}></i>
          </div>
        );

        return link ? (
          <a key={`client-${index}`} href={link} target="_blank" rel="noopener noreferrer">
            {badge}
          </a>
        ) : (
          <div key={`client-${index}`}>{badge}</div>
        );
      })}
    </div>
  );
};

const AgentCardOverview: React.FC<AgentCardOverviewProps> = ({ agent }) => {
  const bioText =
    agent.bio?.length > 0 ? agent.bio.join('.\n') : 'No bio available';

  return (
    <div className="bg-white rounded-lg overflow-hidden mb-6">
      
        <div className="relative p-9 bg-beige-200">
          <div className="absolute flex flex-row justify-between top-2 left-4">
            {renderClientBadgesOverview(agent.clients)}
          </div>
          {agent.face_image_path ? (
            <img
              className="cursor-default rounded-full h-20 w-20 absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 border-4 border-white dark:border-gray-800 transition-transform duration-300 hover:scale-105 object-cover"
              src={`${import.meta.env.VITE_AVATAR_BUCKET_BASE_URL}/${agent.face_image_path}`}
            />
          ) : (
            <div className="h-20 w-20 bg-white rounded-full p-2 border items-center justify-center flex absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 border-4 border-white dark:border-gray-800 transition-transform duration-300 hover:scale-105 object-cover">
              <i className="fa fa-user fa-2x"></i>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 p-4 pt-14 cursor-default">
          <div className="flex flex-col items-center justify-between gap-2">
            <span className="text-2xl font-anek-latin font-bold text-center">
              {agent.name}
            </span>
          </div>

          <div className="mt-6 text-center font-black">
            <p className="mb-4 font-thin">
              {bioText.length > 250 ? `${bioText.substring(0, 250)}...` : bioText}
            </p>
          </div>
        </div>
    </div>
  );
};

export default AgentCardOverview;
