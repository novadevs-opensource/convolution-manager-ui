// src/hooks/useAgentHooks.ts
import { useAgentContext } from '../context/AgentContext';
import { useAuth } from './useAuth';

/**
 * Custom hook that provides simplified agent actions and status information
 * for a specific agent. This hook helps determine which buttons should
 * be displayed in the UI based on the current state.
 */
export const useAgentHooks = (agentId?: string) => {
  const { userProfile } = useAuth();
  const { 
    agentStatus, 
    startAgent: contextStartAgent, 
    stopAgent: contextStopAgent,
    saveAgent: contextSaveAgent,
    updateAgent: contextUpdateAgent,
    currentAgent
  } = useAgentContext();
  
  // Check if this specific agent is running
  const isRunning = agentId ? !!agentStatus[agentId] : false;
  
  // Get character data from context if available
  const hasCharacterData = !!currentAgent.characterData;
  const hasProviderData = !!(currentAgent.providerName && currentAgent.providerModel);
  
  // Simplified action functions that don't need parameters
  const startAgent = () => {
    if (userProfile?.id && agentId) {
      contextStartAgent();
    }
  };
  
  const stopAgent = () => {
    if (userProfile?.id && agentId) {
      contextStopAgent();
    }
  };
  
  const saveAgent = () => {
    if (userProfile?.id) {
      contextSaveAgent();
    }
  };
  
  const updateAgent = () => {
    if (userProfile?.id && agentId) {
      contextUpdateAgent();
    }
  };
  
  return {
    isRunning,
    hasAgentId: !!agentId,
    hasCharacterData,
    hasProviderData,
    startAgent,
    stopAgent,
    saveAgent,
    updateAgent
  };
};

export default useAgentHooks;