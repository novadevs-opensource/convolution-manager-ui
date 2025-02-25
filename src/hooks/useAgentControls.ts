// src/hooks/useAgentControls.ts
import { useEffect } from 'react';
import { useAgentContext } from '../context/AgentContext';
import { useEventsQueue } from './useEventsQueue';

/**
 * Hook that combines agent context with real-time events processing
 * Can be used without params for consuming from context
 * Or with params to initialize context with data
 */
export const useAgentControls = (
  agentId?: string,
  characterData?: any,
  providerName?: string,
  providerModel?: string
) => {

  // Extract individual properties we need instead of the whole object
  const { 
    setCurrentAgent,
    agentStatus,
    startAgent,
    stopAgent,
    saveAgent,
    updateAgent,
    currentAgent,
    hasAgentId,
    hasCharacterData,
    hasProviderData,
    isLoading
  } = useAgentContext();
  
  // Get events from the shared queue
  const events = useEventsQueue();
  
  useEffect(() => {
    // Only initialize if we have data to initialize
    if (agentId || characterData || providerName || providerModel) {
      setCurrentAgent({
        id: agentId,
        characterData,
        providerName,
        providerModel
      });
    }
  }, [agentId, characterData, providerName, providerModel, setCurrentAgent]); // setCurrentAgent instead of the whole context (to prevent loops)
  
  // Process incoming events
  useEffect(() => {
    if (events.length > 0 && currentAgent.id) {
      const latestEvent = events[events.length - 1];
      console.log('Latest event:', latestEvent);
      
      // TODO: Should analyze events here and update state as needed?
    }
  }, [events, currentAgent.id]);
  

  const isAgentRunning = currentAgent.id  ? !!agentStatus[currentAgent.id] : false;

  return {
    agentStatus: isAgentRunning,
    startAgent,
    stopAgent,
    saveAgent,
    updateAgent,
    currentAgent,
    hasAgentId,
    hasCharacterData,
    hasProviderData,
    isLoading,
    setCurrentAgent
  };
};

export default useAgentControls;