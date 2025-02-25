// src/components/agent/AgentActionButtons.tsx
import React from 'react';

interface AgentActionButtonsProps {
  agentId?: string;
  agentStatus: boolean;
  hasCharacterData: boolean;
  hasProviderData: boolean;
  onStart: () => void;
  onStop: () => void;
  onSave: () => void;
  onUpdate: () => void;
}

const AgentActionButtons: React.FC<AgentActionButtonsProps> = ({ 
  agentId, 
  agentStatus, 
  hasCharacterData, 
  hasProviderData,
  onStart, 
  onStop, 
  onSave, 
  onUpdate 
}) => {
  const buttonClass = 'inline-flex py-2 lg:px-14 px-9 shadow-md font-normal font-afacad uppercase justify-center rounded-full border-2 border-black transition-colors bg-black-dark text-white hover:bg-white hover:text-black items-center gap-2';

  if (agentId) {
    return (
      <div className="form-group mb-0">
        {!agentStatus && !hasCharacterData && hasProviderData && (
          <button className={buttonClass} onClick={onStart}>
            Activar <i className='fa-solid fa-play'></i>
          </button>
        )}
        {agentStatus && !hasCharacterData && hasProviderData && (
          <button className={buttonClass} onClick={onStop}>
            Pausar <i className='fa-solid fa-stop'></i>
          </button>
        )}
        {hasCharacterData && hasProviderData && (
          <button className={buttonClass} onClick={onUpdate}>
            Actualizar <i className='fa-solid fa-save'></i>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="form-group mb-0">
      {hasCharacterData && (
        <button className={buttonClass} onClick={onSave}>
          Guardar <i className='fa-solid fa-save'></i>
        </button>
      )}
    </div>
  );
};

export default AgentActionButtons;