// src/context/AgentContext.tsx 
// TODO: Refactor this piece of black magic
import React, { createContext, useState, useContext } from 'react';
import { enqueueEvent } from '../services/messageHandler';
import { BootAgentEvent, StopAgentEvent, UpdateAgentEvent } from '../types/commEvents';
import { useToasts } from '../hooks/useToasts';
import { ApiKeyService } from '../services/apiKeyService';
import { useAgent } from '../hooks/useAgent';
import { CharacterData } from '../types';

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
  startAgent: (userId?: string, agentId?: string, llmProvider?: string, llmModel?: string) => void;
  stopAgent: (userId?: string, agentId?: string) => void;
  saveAgent: (
    userId: string, 
    characterData: CharacterData, 
    llmModel?: string, 
    options?: {
      onSuccess?: (data: any) => void,
      redirectTo?: string
    }
  ) => void;
  updateAgent: (
    userId: string, 
    agentId: string, 
    characterData: CharacterData, 
    llmModel?: string, 
    options?: {
      onSuccess?: (data: any) => void,
      redirectTo?: string
    }
  ) => void;
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
  const startAgent = (userId?: string, agentId?: string, llmProvider?: string, llmModel?: string) => {
    if (!checkApiKey()) return;

    if (userId && agentId && llmProvider && llmModel) {
      const eventBody: BootAgentEvent = {
        action: "boot",
        agentId,
        userId,
      };
      
      try {
        enqueueEvent(eventBody, eventBody.action, eventBody.userId, eventBody.agentId);
        console.log('Agent start event enqueued:', eventBody);
        
        // Actualizamos el estado para este agente específico
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
  const stopAgent = (userId?: string, agentId?: string) => {
    if (userId && agentId) {
      const eventBody: StopAgentEvent = {
        action: "stop",
        agentId,
        userId,
      };
      
      try {
        enqueueEvent(eventBody, eventBody.action, eventBody.userId, eventBody.agentId);
        console.log('Agent stop event enqueued:', eventBody);
        
        // Actualizamos el estado para este agente específico
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
  const saveAgent = (
    userId: string, 
    characterData: CharacterData, 
    llmModel?: string, 
    options?: {
      onSuccess?: (data: any) => void,
      redirectTo?: string
    }
  ) => {
    if (!checkApiKey()) return;
    
    if (userId && llmModel && characterData) {
      saveHandler(userId, llmModel, apiKey!, characterData, {
        ...options,
        onSuccess: (data) => {
          addNotification('Agent saved successfully', 'success');
          if (options?.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
          if ('errors' in error) {
            // Format validation errors for better user experience
            const messages = Object.entries(error.errors)
              .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
              .join('; ');
            addNotification(`Failed to save agent: ${messages}`, 'error');
          } else {
            addNotification(`Failed to save agent: ${error.message}`, 'error');
          }
        }
      });
    } else {
      addNotification('Missing data for saving the agent', 'error');
    }
  };

  // Update agent function (for existing agents)
  const updateAgent = (
    userId: string, 
    agentId: string, 
    characterData: CharacterData, 
    llmModel?: string, 
    options?: {
      onSuccess?: (data: any) => void,
      redirectTo?: string
    }
  ) => {
    if (!checkApiKey()) return;
    
    if (agentId && llmModel && characterData) {
      updateHandler(agentId, llmModel, apiKey!, characterData, {
        ...options,
        onSuccess: (data) => {
          // Enqueue the update event
          const eventBody: UpdateAgentEvent = {
            action: "update",
            agentId,
            userId,
          };
          enqueueEvent(eventBody, eventBody.action, eventBody.userId, eventBody.agentId);
          console.log('Agent update event enqueued:', eventBody);
          
          addNotification('Agent updated successfully', 'success');
          if (options?.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
          if ('errors' in error) {
            // Format validation errors
            const messages = Object.entries(error.errors)
              .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
              .join('; ');
            addNotification(`Failed to update agent: ${messages}`, 'error');
          } else {
            addNotification(`Failed to update agent: ${error.message}`, 'error');
          }
        }
      });
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