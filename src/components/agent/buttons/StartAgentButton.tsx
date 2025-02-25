// src/components/agent/buttons/StartAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';

interface StartButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Button to start an agent - UI only
 */
const StartAgentButton: React.FC<StartButtonProps> = ({ 
  onClick, 
  className = '',
  disabled = false
}) => {
  return (
    <Button
      onClick={onClick}
      label="Start"
      icon="fa-play"
      disabled={disabled}
      className={className}
    />
  );
};

export default StartAgentButton;