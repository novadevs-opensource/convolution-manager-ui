// src/components/agent/buttons/StopAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';

interface StopAgentButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  isRunning?: boolean;
  showAlways?: boolean;
}

/**
 * Button to stop an agent - UI only
 */
const StopAgentButton: React.FC<StopAgentButtonProps> = ({ 
  onClick, 
  className = '',
  disabled = false,
  loading = false,
  isRunning = false,
  showAlways = false
}) => {
  // Visibility logic - show if criteria met or showAlways is true
  const shouldShow = showAlways || isRunning;
  
  if (!shouldShow) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      label={loading ? "Deteniendo..." : "Pausar"}
      icon={loading ? "fa-spinner fa-spin" : "fa-stop"}
      disabled={disabled || loading}
      className={className}
    />
  );
};

export default StopAgentButton;