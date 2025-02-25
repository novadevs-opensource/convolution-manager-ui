// src/components/characterEditor/AgentControlsSection.tsx
import React from 'react';
import useMessageListener from '../../hooks/useMessageListener';
import { CharacterData } from '../../types';
import { useAgentControls } from '../../hooks/useAgentControls';
import SectionContainer from '../common/SectionContainer';
import AgentActionButtons from '../agent/AgentActionButtons';

interface AgentControlsSectionProps {
  userId: string;
  agentId?: string;
  characterData?: CharacterData;
  llm_provider_name?: string;
  llm_provider_model?: string;
}

const AgentControlsSection: React.FC<AgentControlsSectionProps> = ({
  userId,
  agentId,
  characterData,
  llm_provider_name,
  llm_provider_model,
}) => {
  const interval = 5000; // Intervalo de escucha (en milisegundos)
  const messages = useMessageListener(userId, interval);
  
  const {
    agentStatus,
    startAgent,
    stopAgent,
    saveAgent,
    updateAgent,
    hasCharacterData,
    hasProviderData
  } = useAgentControls(
    userId,
    agentId,
    characterData,
    llm_provider_name,
    llm_provider_model
  );

  // Podemos registrar mensajes si es necesario
  React.useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <SectionContainer 
      id="agent-controls-section"
      title="Agent controls"
      helpTitle="Control your agent status"
    > 
      <AgentActionButtons
        agentId={agentId}
        agentStatus={agentStatus}
        hasCharacterData={hasCharacterData}
        hasProviderData={hasProviderData}
        onStart={startAgent}
        onStop={stopAgent}
        onSave={saveAgent}
        onUpdate={updateAgent}
      />
    </SectionContainer>
  );
};

export default AgentControlsSection;
