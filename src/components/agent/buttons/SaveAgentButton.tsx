// src/components/agent/buttons/SaveAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';
import { useAgentControls } from '../../../hooks/useAgentControls';

interface SaveButtonProps {
  className?: string;
  showAlways?: boolean;
}

/**
 * Button component to save an agent
 * Can be placed anywhere in the UI
 */
const SaveAgentButton: React.FC<SaveButtonProps> = ({ 
  className = '', 
  showAlways = false 
}) => {
  const { saveAgent, hasCharacterData } = useAgentControls();
  
  // Visibility logic - show if criteria met or showAlways is true
  const shouldShow = showAlways || hasCharacterData;
  
  if (!shouldShow) {
    return null;
  }

  return (
    <div className={className}>
      <Button
        onClick={saveAgent}
        label="Save"
        icon="fa-save"
      />
    </div>
  );
};

export default SaveAgentButton;