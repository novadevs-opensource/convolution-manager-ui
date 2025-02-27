// src/components/agent/buttons/StartAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';

interface StartAgentButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  isRunning?: boolean;
  hasProviderData?: boolean;
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
  hasProviderData = false,
  showAlways = false
}) => {
  // Visibility logic - show if criteria met or showAlways is true
  const shouldShow = showAlways || (!isRunning && hasProviderData);
  
  if (!shouldShow) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      label={loading ? "Iniciando..." : "Activar"}
      icon={loading ? "fa-spinner fa-spin" : "fa-play"}
      disabled={disabled || loading}
      className={className}
    />
  );
};

export default StartAgentButton;