// src/hooks/useAgentControls.ts
import { useState, useEffect } from 'react';
import useMessageListener from './useMessageListener';
import { CharacterData } from '../types';
import { useAgentStatus } from '../context/AgentStatusContext';

export const useAgentControls = (
  userId: string,
  agentId?: string,
  characterData?: CharacterData,
  llm_provider_name?: string,
  llm_provider_model?: string
) => {
  const [definition] = useState(characterData);
  const { agentStatus, startAgent, stopAgent, saveAgent, updateAgent } = useAgentStatus();
  const messages = useMessageListener(userId, 5000);

  // Procesar mensajes recibidos
  useEffect(() => {
    if (messages && messages.length > 0 && agentId) {
      const latestMessage = messages[messages.length - 1];
      console.log('Latest message:', latestMessage);
      
      // Aquí podrías analizar los mensajes para actualizar el estado si es necesario
    }
  }, [messages, agentId]);

  // Wrappers para las funciones del contexto
  const handleStartAgent = () => {
    if (userId && agentId && llm_provider_name && llm_provider_model) {
      startAgent(userId, agentId, llm_provider_name, llm_provider_model);
    }
  };

  const handleStopAgent = () => {
    if (userId && agentId) {
      stopAgent(userId, agentId);
    }
  };

  const handleSaveAgent = () => {
    if (userId && definition && llm_provider_model) {
      saveAgent(userId, definition, llm_provider_model);
    }
  };

  const handleUpdateAgent = () => {
    if (userId && agentId && definition && llm_provider_model) {
      updateAgent(userId, agentId, definition, llm_provider_model);
    }
  };

  return {
    agentStatus: agentId ? !!agentStatus[agentId] : false,
    startAgent: handleStartAgent,
    stopAgent: handleStopAgent,
    saveAgent: handleSaveAgent,
    updateAgent: handleUpdateAgent,
    hasCharacterData: !!characterData,
    hasProviderData: !!(llm_provider_name && llm_provider_model)
  };
};