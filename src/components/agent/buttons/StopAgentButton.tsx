// src/components/agent/buttons/SaveAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';

interface SaveButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Button to save an agent - UI only
 */
const SaveAgentButton: React.FC<SaveButtonProps> = ({ 
  onClick, 
  className = '',
  disabled = false
}) => {
  return (
    <Button
      onClick={onClick}
      label="Stop"
      icon="fa-stop"
      disabled={disabled}
      className={className}
    />
  );
};

export default SaveAgentButton;