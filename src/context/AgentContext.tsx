// src/context/AgentContext.tsx 
// TODO: Refactor this piece of black magic
import React, { createContext, useState, useContext } from 'react';
import { enqueueEvent } from '../services/messageHandler';
import { BootAgentEvent, StopAgentEvent, UpdateAgentEvent } from '../types/commEvents';
import { useToasts } from '../hooks/useToasts';
import { ApiKeyService } from '../services/apiKeyService';
import { useAgent } from '../hooks/useAgent';
import { CharacterData } from '../types';
import { useAuth } from '../hooks/useAuth';

// Context interface with all agent-related state and functions
interface AgentContextType {
  agentStatus: Record<string, boolean>;
  currentAgent: {
    id?: string;
    characterData?: CharacterData;
    providerName?: string;
    providerModel?: string;
  };
  setCurrentAgent: (data: {
    id?: string;
    characterData?: CharacterData;
    providerName?: string;
    providerModel?: string;
  }) => void;
  startAgent: () => void;
  stopAgent: () => void;
  saveAgent: () => void;
  updateAgent: () => void;
  hasAgentId: boolean;
  hasCharacterData: boolean;
  hasProviderData: boolean;
  isLoading: boolean;
}

// Create the context
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Provider component
export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentStatus, setAgentStatus] = useState<Record<string, boolean>>({});
  const [currentAgent, setCurrentAgent] = useState<{
    id?: string;
    characterData?: CharacterData;
    providerName?: string;
    providerModel?: string;
  }>({});
  
  const { addNotification } = useToasts();
  const { loading: isLoading, saveHandler, updateHandler } = useAgent();
  const [apiKey] = useState<string|null>(ApiKeyService.getInstance().getApiKey());
  const { userProfile } = useAuth();
  
  // Derived states for conditional rendering
  const hasAgentId = !!currentAgent.id;
  const hasCharacterData = !!currentAgent.characterData;
  const hasProviderData = !!(currentAgent.providerName && currentAgent.providerModel);
  
  // Check if API key is available
  const checkApiKey = (): boolean => {
    if (!apiKey) {
      addNotification('Please, introduce your Open Router API key', 'error');
      return false;
    }
    return true;
  };

  // Start agent function
  const startAgent = () => {
    if (!checkApiKey() || !userProfile?.id) return;
    
    const { id: agentId, providerName, providerModel } = currentAgent;
    
    if (agentId && providerName && providerModel) {
      const eventBody: BootAgentEvent = {
        action: "boot",
        agentId,
      };
      
      try {
        enqueueEvent(eventBody, eventBody.action, userProfile.id, agentId);
        console.log('Agent start event enqueued:', eventBody);
        
        // Update status for this specific agent
        setAgentStatus(prev => ({
          ...prev,
          [agentId]: true
        }));
        
        addNotification('Agent started successfully', 'success');
      } catch (error) {
        console.error('Error starting agent:', error);
        addNotification('Failed to start agent. Please try again.', 'error');
      }
    } else {
      console.error('Unable to launch agent, invalid data.');
      addNotification('Missing required data to start the agent', 'error');
    }
  };

  // Stop agent function
  const stopAgent = () => {
    if (!userProfile?.id) return;
    
    const { id: agentId } = currentAgent;
    
    if (agentId) {
      const eventBody: StopAgentEvent = {
        action: "stop",
        agentId,
      };
      
      try {
        enqueueEvent(eventBody, eventBody.action, userProfile.id, agentId);
        console.log('Agent stop event enqueued:', eventBody);
        
        // Update status for this specific agent
        setAgentStatus(prev => ({
          ...prev,
          [agentId]: false
        }));
        
        addNotification('Agent stopped successfully', 'success');
      } catch (error) {
        console.error('Error stopping agent:', error);
        addNotification('Failed to stop agent. Please try again.', 'error');
      }
    } else {
      console.error('Unable to stop agent, invalid data.');
      addNotification('Missing required data to stop the agent', 'error');
    }
  };

  // Save agent function (for new agents)
  const saveAgent = () => {
    if (!checkApiKey() || !userProfile?.id) return;
    
    const { characterData, providerModel } = currentAgent;
    
    if (userProfile.id && providerModel && characterData) {
      saveHandler(userProfile.id, providerModel, apiKey!, characterData);
      addNotification('Agent saved successfully', 'success');
    } else {
      addNotification('Missing data for saving the agent', 'error');
    }
  };

  // Update agent function (for existing agents)
  const updateAgent = () => {
    if (!checkApiKey() || !userProfile?.id) return;
    
    const { id: agentId, characterData, providerModel } = currentAgent;
    
    if (agentId && providerModel && characterData) {
      updateHandler(agentId, providerModel, apiKey!, characterData);
      
      const eventBody: UpdateAgentEvent = {
        action: "update",
        agentId,
      };
      
      enqueueEvent(eventBody, eventBody.action, userProfile.id, agentId);
      addNotification('Agent updated successfully', 'success');
    } else {
      addNotification('Missing data for updating the agent', 'error');
    }
  };

  return (
    <AgentContext.Provider value={{ 
      agentStatus,
      currentAgent,
      setCurrentAgent,
      startAgent,
      stopAgent,
      saveAgent,
      updateAgent,
      hasAgentId,
      hasCharacterData,
      hasProviderData,
      isLoading
    }}>
      {children}
    </AgentContext.Provider>
  );
};

// Hook to use the agent context
export const useAgentContext = () => {
  const context = useContext(AgentContext);
  
  if (context === undefined) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  
  return context;
};