// src/components/agent/buttons/UpdateAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';

interface UpdateButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Button to update an agent - UI only
 */
const UpdateAgentButton: React.FC<UpdateButtonProps> = ({ 
  onClick, 
  className = '',
  disabled = false
}) => {
  return (
    <Button
      onClick={onClick}
      label="Update"
      icon="fa-save"
      disabled={disabled}
      className={className}
    />
  );
};

export default UpdateAgentButton;