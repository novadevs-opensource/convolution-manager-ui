// src/hooks/useAgentHooks.ts - Actualizado para nuevas firmas de función
import { useCallback } from 'react';
import { useAgentContext } from '../context/AgentContext';
import { useAuth } from '../hooks/useAuth';

/**
 * Custom hook that provides simplified agent actions with navigation options
 */
export const useAgentHooks = (agentId?: string) => {
  const { userProfile } = useAuth();
  const { 
    agentStatus, 
    startAgent: contextStartAgent, 
    stopAgent: contextStopAgent,
    saveAgent: contextSaveAgent,
    updateAgent: contextUpdateAgent,
    currentAgent,
    hasAgentId,
    hasCharacterData,
    hasProviderData
  } = useAgentContext();
  
  // Check if this specific agent is running
  const isRunning = agentId ? !!agentStatus[agentId] : false;
  
  // Simplified action functions with redirect options
  const startAgent = useCallback(() => {
    if (userProfile?.id && agentId && currentAgent.providerName && currentAgent.providerModel) {
      contextStartAgent(userProfile.id, agentId, currentAgent.providerName, currentAgent.providerModel);
    }
  }, [userProfile?.id, agentId, currentAgent.providerName, currentAgent.providerModel, contextStartAgent]);
  
  const stopAgent = useCallback(() => {
    if (userProfile?.id && agentId) {
      contextStopAgent(userProfile.id, agentId);
    }
  }, [userProfile?.id, agentId, contextStopAgent]);
  
  const saveAgent = useCallback((options?: {
    onSuccess?: (data: any) => void,
    redirectTo?: string
  }) => {
    if (userProfile?.id && currentAgent.characterData && currentAgent.providerModel) {
      contextSaveAgent(
        userProfile.id, 
        currentAgent.characterData, 
        currentAgent.providerModel,
        options
      );
    }
  }, [userProfile?.id, currentAgent.characterData, currentAgent.providerModel, contextSaveAgent]);
  
  const updateAgent = useCallback((options?: {
    onSuccess?: (data: any) => void,
    redirectTo?: string
  }) => {
    if (userProfile?.id && agentId && currentAgent.characterData && currentAgent.providerModel) {
      contextUpdateAgent(
        userProfile.id, 
        agentId, 
        currentAgent.characterData, 
        currentAgent.providerModel,
        options
      );
    }
  }, [userProfile?.id, agentId, currentAgent.characterData, currentAgent.providerModel, contextUpdateAgent]);
  
  return {
    isRunning,
    hasAgentId,
    hasCharacterData,
    hasProviderData,
    startAgent,
    stopAgent,
    saveAgent,
    updateAgent
  };
};

export default useAgentHooks;