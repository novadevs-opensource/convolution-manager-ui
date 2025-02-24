// src/components/characterEditor/GenerateCharacterSection.tsx
import React, { useEffect, useState } from 'react';
import { enqueueEvent } from '../../services/messageHandler';
import { BootAgentEvent, StopAgentEvent, UpdateAgentEvent } from '../../types/commEvents';
import useMessageListener from '../../hooks/useMessageListener';
import { CharacterData } from '../../types';
import { useAgent } from '../../hooks/useAgent';
import { useNavigate } from 'react-router-dom';

interface GenerateCharacterSectionProps {
  userId: string,
  agentId?: string,
  characterData?: CharacterData,
  llm_provider_name?: string,
  llm_provider_model?: string,
  llm_provider_api_key?: string,
}

const AgentControlsSection: React.FC<GenerateCharacterSectionProps> = ({
  userId,
  agentId,
  characterData,
  llm_provider_name,
  llm_provider_model,
  llm_provider_api_key,
}) => {
  let navigate = useNavigate();
  const [agentStatus, setAgentStatus] = useState<boolean>(false);
  const [interval] = useState(5000); // Intervalo de escucha (en milisegundos)
  const [definition, setDefinition] = useState(characterData);
  const messages = useMessageListener(userId, interval);
  const { response, error, saveHandler, updateHandler } = useAgent();

  const startAgent = () => {
    if (agentId && llm_provider_name && llm_provider_model && llm_provider_api_key) {
      let eventBody: BootAgentEvent = {
        action: "boot",
        agentId: agentId,
      }
      enqueueEvent(eventBody, eventBody.action, userId, eventBody.agentId);
      setAgentStatus(true) 
    } else {
      console.error('Unable to launch agent, invalid data.')
    }
  }

  const stopAgent = () => {
    if (agentId) {
      let eventBody: StopAgentEvent = {
        action: "stop",
        agentId: agentId,
      }
      enqueueEvent(eventBody, eventBody.action, userId, eventBody.agentId);
      setAgentStatus(true) 
    } else {
      console.error('Unable to stop agent, invalid data.')
    }
    setAgentStatus(false)
  }

  useEffect(() => {
    setDefinition(characterData);
  }, [characterData])

  const saveAgent = () => {
    if (userId && llm_provider_model && llm_provider_api_key && definition) {
      saveHandler(userId, llm_provider_model, llm_provider_api_key, definition)
    } else {
      alert('faltan datos');
    }
    setAgentStatus(false)
  }

  const updateAgent = () => {
    if (agentId && llm_provider_model && llm_provider_api_key && definition) {
      updateHandler(agentId, llm_provider_model, llm_provider_api_key, definition)
      let eventBody: UpdateAgentEvent = {
        action: "update",
        agentId: agentId,
      }
      enqueueEvent(eventBody, eventBody.action, userId, eventBody.agentId)
    } else {
      alert('faltan datos');
    }
    setAgentStatus(false)
  }

  useEffect(() => {
    if (response) {
      alert(response.message);
      navigate("/dashboard");
    }
    if (error) {
      console.log(error);
    }
  }, 
  [error, response]);

  useEffect(() => {
    console.log(messages);
  }, [messages])

  return (
    <section className="section" id="generate-character-section" style={{alignSelf: 'flex-end', width: '50%'}}>
      <div className="section-header">
        <span>Agent controls</span>
        <button
          className="icon-button help-button"
          title="Control your agent status"
        >
          <i className="fa-solid fa-arrow-trend-up"></i>
        </button>
      </div>
      <div className="section-content">
        <div className="form-group">
            <span>{agentStatus ? 'on' : 'off'}</span>
        </div>
        {agentId ? (
          <div className="form-group">
          {!agentStatus && characterData && llm_provider_name && llm_provider_model && llm_provider_api_key && (
            <button onClick={startAgent}>
              Activar <i className='fa-solid fa-play'></i>
            </button>
          )}
          {agentStatus && characterData && llm_provider_name && llm_provider_model && llm_provider_api_key && (
            <button onClick={stopAgent}>
              Pausar <i className='fa-solid fa-stop'></i>
            </button>
          )}
          {characterData && llm_provider_name && llm_provider_model && llm_provider_api_key && (
            <button onClick={updateAgent}>
              Actualizar <i className='fa-solid fa-save'></i>
            </button>
          )}
          </div>
        ) : (
          <div className="form-group">
          {characterData && (
            <button onClick={saveAgent}>
              Guardar <i className='fa-solid fa-save'></i>
            </button>
          )}
          </div>
        )}

      </div>
    </section>
  );
};

export default AgentControlsSection;
