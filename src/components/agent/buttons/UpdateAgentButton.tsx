// src/components/agent/buttons/UpdateAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';

interface UpdateAgentButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  showAlways?: boolean;
}

/**
 * Button to update an agent - UI only
 */
const UpdateAgentButton: React.FC<UpdateAgentButtonProps> = ({ 
  onClick, 
  className = '',
  disabled = false,
  loading = false,
}) => {
  return (
    <Button
      onClick={onClick}
      label={loading ? "Updating settings..." : "Update settings"}
      icon={loading ? "fa-spinner fa-spin" : "fa-sync"}
      disabled={disabled || loading}
      className={className}
    />
  );
};

export default UpdateAgentButton;