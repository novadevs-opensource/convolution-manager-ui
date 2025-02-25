// src/components/agent/AgentStatus.tsx
import React from 'react';
import { FaCircle } from "react-icons/fa6";

interface AgentStatusProps {
  status: boolean;
}

const AgentStatus: React.FC<AgentStatusProps> = ({ status }) => {
  return (
    <div className='border inline-flex px-4 py-1 rounded-full border-gray-200 bg-white'>
        {status ? (
        <div className='flex flex-row gap-2 items-center'>
            <span className='text-black-light text-xs uppercase'>
                Running
            </span>
            <span className='text-green-400 text-xs'>
                <FaCircle />
            </span>
        </div>
        ) : (
        <div className='flex flex-row gap-2 items-center uppercase'>
            <span className='text-black-light text-xs'>
                Stopped
            </span>
            <span className='text-red-400 text-xs'>
                <FaCircle />
            </span>
        </div>
        )}
    </div>
  );
};

export default AgentStatus;