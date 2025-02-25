// src/context/AgentStatusContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { enqueueEvent } from '../services/messageHandler';
import { BootAgentEvent, StopAgentEvent, UpdateAgentEvent } from '../types/commEvents';
import { useNotifications } from '../hooks/useNotifications';
import { ApiKeyService } from '../services/apiKeyService';
import { useAgent } from '../hooks/useAgent';
import { CharacterData } from '../types';

interface AgentStatusContextType {
  agentStatus: Record<string, boolean>;
  startAgent: (userId: string, agentId: string, llmProvider?: string, llmModel?: string) => void;
  stopAgent: (userId: string, agentId: string) => void;
  saveAgent: (userId: string, characterData: CharacterData, llmModel?: string) => void;
  updateAgent: (userId: string, agentId: string, characterData: CharacterData, llmModel?: string) => void;
}

const AgentStatusContext = createContext<AgentStatusContextType | undefined>(undefined);

export const AgentStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentStatus, setAgentStatus] = useState<Record<string, boolean>>({});
  const { addNotification } = useNotifications();
  const { response, error, saveHandler, updateHandler } = useAgent();
  const [apiKey] = useState<string|null>(ApiKeyService.getInstance().getApiKey());

  const checkApiKey = (): boolean => {
    if (!apiKey) {
      addNotification('Please, introduce your Open Router API key', 'error');
      return false;
    }
    return true;
  };

  const startAgent = (userId: string, agentId: string, llmProvider?: string, llmModel?: string) => {
    if (!checkApiKey()) return;
    
    if (agentId && llmProvider && llmModel) {
      const eventBody: BootAgentEvent = {
        action: "boot",
        agentId: agentId,
      };
      
      try {
        enqueueEvent(eventBody, eventBody.action, userId, eventBody.agentId);
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

  const stopAgent = (userId: string, agentId: string) => {
    if (agentId) {
      const eventBody: StopAgentEvent = {
        action: "stop",
        agentId: agentId,
      };
      
      try {
        enqueueEvent(eventBody, eventBody.action, userId, eventBody.agentId);
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

  const saveAgent = (userId: string, characterData: CharacterData, llmModel?: string) => {
    if (!checkApiKey()) return;
    
    if (userId && llmModel && characterData) {
      saveHandler(userId, llmModel, apiKey!, characterData);
      addNotification('Agent saved successfully', 'success');
    } else {
      addNotification('Missing data for saving the agent', 'error');
    }
  };

  const updateAgent = (userId: string, agentId: string, characterData: CharacterData, llmModel?: string) => {
    if (!checkApiKey()) return;
    
    if (agentId && llmModel && characterData) {
      updateHandler(agentId, llmModel, apiKey!, characterData);
      
      const eventBody: UpdateAgentEvent = {
        action: "update",
        agentId: agentId,
      };
      
      enqueueEvent(eventBody, eventBody.action, userId, eventBody.agentId);
      addNotification('Agent updated successfully', 'success');
    } else {
      addNotification('Missing data for updating the agent', 'error');
    }
  };

  // También podríamos agregar un mecanismo para verificar el estado
  // periódicamente desde un servicio

  return (
    <AgentStatusContext.Provider value={{ 
      agentStatus, 
      startAgent, 
      stopAgent, 
      saveAgent, 
      updateAgent 
    }}>
      {children}
    </AgentStatusContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAgentStatus = () => {
  const context = useContext(AgentStatusContext);
  
  if (context === undefined) {
    throw new Error('useAgentStatus must be used within an AgentStatusProvider');
  }
  
  return context;
};