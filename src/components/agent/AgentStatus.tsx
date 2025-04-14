// src/components/agent/AgentStatus.tsx
import React, { useEffect } from 'react';
import { FaCircle, FaSpinner } from "react-icons/fa6";
import { useRuntimeStatus } from '../../hooks/useRuntimeStatus';
import { useToasts } from '../../hooks/useToasts';
import AgentLoader from './AgentLoader';
import { useCharacter } from '../../hooks/useCharacter';

interface AgentStatusProps {
  id: string;
  refreshInterval?: number;
  className?: string;
  withLoader?: boolean
}

/**
 * Component to display the current status of an agent
 */
const AgentStatus: React.FC<AgentStatusProps> = ({ 
  id, 
  refreshInterval = 5000,
  className = '',
  withLoader = false
}) => {
  const { statusData, loading, error } = useRuntimeStatus(id, refreshInterval);
  const { addNotification } = useToasts();
  const {character} = useCharacter(id);
  
  // Show error notifications if fetch fails
  useEffect(() => {
    if (error) {
      addNotification(error, "error");
    }
  }, [error, addNotification]);
  
  // Loading state
  if (loading && !statusData) {
    return (
      <div className={`size-fit border flex inline-flex px-4 py-1 rounded-full bg-white items-center gap-2 uppercase ${className}`}>
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
        <div className={`size-fit flex flex-row px-2 py-1 rounded-full bg-green-50 items-center gap-2 font-anek-latin ${className}`}>
          <span className='text-green-400'>
            <FaCircle size={11}/>
          </span>
          <span className='text-black text-xs uppercase'>
            Running
          </span>
        </div>
      );
      
    case 'stopped':
      return (
        <div className={`size-fit flex flex-row px-2 py-1 rounded-full bg-red-100 items-center gap-2 font-anek-latin ${className}`}>
          <span className='text-red-400'>
            <FaCircle size={11}/>
          </span>
          <span className='text-black text-xs font-semibold'>
            Stopped
          </span>
        </div>
      );
      
    case 'unknown':
      if (withLoader) {
        return (
          <div className="rounded-lg w-full">
            <AgentLoader 
              loadingText={`Pending`}
              timeFrom={character?.updated_at!}
            />
          </div>
        );        
      }

      return (
        <div className={`size-fit flex px-2 py-1 rounded-full bg-orange-50 items-center gap-2 font-anek-latin ${className}`}>
          <span className='text-orange-400 animate-pulse'>
            <FaCircle size={11}/>
          </span>
          <span className='text-black text-xs font-semibold'>
            Pending
          </span>
        </div>
      );

      
    default:
      return (
        <div className={`size-fit flex px-2 py-1 rounded-full bg-slate-200 items-center gap-2 font-anek-latin ${className}`}>
          <span className='text-slate-500'>
            <FaCircle size={11}/>
          </span>
          <span className='text-black text-xs font-semibold'>
            Offline
          </span>
        </div>
      );
  }
};

export default AgentStatus;