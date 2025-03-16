// src/components/agent/buttons/StartAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';

interface StartAgentButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  isRunning?: boolean;
  showAlways?: boolean;
}

/**
 * Button to start an agent - UI only
 */
const StartAgentButton: React.FC<StartAgentButtonProps> = ({ 
  onClick, 
  className = '',
  disabled = false,
  loading = false,
  isRunning = false,
  showAlways = false
}) => {
  // Don't show the button if the agent is already running (unless showAlways is true)
  if (isRunning && !showAlways) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      label={loading ? "Pending..." : "Run ICON"}
      icon={loading ? "fa-spinner fa-spin" : "fa-play"}
      disabled={disabled || loading}
      className={className}
    />
  );
};

export default StartAgentButton;