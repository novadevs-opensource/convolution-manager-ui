// src/components/agent/AgentStatus.tsx
import React, { useEffect } from 'react';
import { FaCircle, FaSpinner } from "react-icons/fa6";
import { useRuntimeStatus } from '../../hooks/useRuntimeStatus';
import { useToasts } from '../../hooks/useToasts';

interface AgentStatusProps {
  id: string;
  refreshInterval?: number;
  className?: string;
}

/**
 * Component to display the current status of an agent
 */
const AgentStatus: React.FC<AgentStatusProps> = ({ 
  id, 
  refreshInterval = 5000,
  className = ''
}) => {
  const { statusData, loading, error } = useRuntimeStatus(id, refreshInterval);
  const { addNotification } = useToasts();
  
  // Show error notifications if fetch fails
  useEffect(() => {
    if (error) {
      addNotification(error, "error");
    }
  }, [error, addNotification]);
  
  // Loading state
  if (loading && !statusData) {
    return (
      <div className={`size-fit border flex inline-flex px-4 py-1 rounded-full border-gray-200 bg-white items-center gap-2 uppercase ${className}`}>
        <span className='text-black-light text-xs uppercase'>
          Loading
        </span>
        <span className='text-orange-400 text-xs animate-spin'>
          <FaSpinner />
        </span>
      </div>
    );
  }

  // Render based on status
  switch (statusData?.status) {
    case 'running':
      return (
        <div className={`size-fit border flex inline-flex px-4 py-1 rounded-full border-gray-200 bg-white items-center gap-2 uppercase ${className}`}>
          <span className='text-black-light text-xs uppercase'>
            Running
          </span>
          <span className='text-green-400 text-xs'>
            <FaCircle />
          </span>
        </div>
      );
      
    case 'stopped':
      return (
        <div className={`border flex inline-flex px-4 py-1 rounded-full border-gray-200 bg-white items-center gap-2 uppercase ${className}`}>
          <span className='text-black-light text-xs'>
            Stopped
          </span>
          <span className='text-red-400 text-xs'>
            <FaCircle />
          </span>
        </div>
      );
      
    case 'unknown':
      return (
        <div className={`border flex inline-flex px-4 py-1 rounded-full border-gray-200 bg-white items-center gap-2 uppercase ${className}`}>
          <span className='text-black-light text-xs'>
            Pending
          </span>
          <span className='text-orange-400 text-xs animate-pulse'>
            <FaCircle />
          </span>
        </div>
      );
      
    default:
      return (
        <div className={`border flex inline-flex px-4 py-1 rounded-full border-gray-200 bg-white items-center gap-2 uppercase ${className}`}>
          <span className='text-black-light text-xs'>
            Offline
          </span>
          <span className='text-gray-400 text-xs'>
            <FaCircle />
          </span>
        </div>
      );
  }
};

export default AgentStatus;