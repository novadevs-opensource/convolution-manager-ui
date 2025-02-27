// src/components/agent/buttons/UpdateAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';

interface UpdateAgentButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  hasCharacterData?: boolean;
  hasProviderData?: boolean;
  hasAgentId?: boolean;
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
  hasCharacterData = false,
  hasProviderData = false,
  hasAgentId = false,
  showAlways = false
}) => {
  // Visibility logic - show if criteria met or showAlways is true
  const shouldShow = showAlways || (hasCharacterData && hasProviderData && hasAgentId);
  
  if (!shouldShow) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      label={loading ? "Actualizando..." : "Actualizar"}
      icon={loading ? "fa-spinner fa-spin" : "fa-save"}
      disabled={disabled || loading}
      className={className}
    />
  );
};

export default UpdateAgentButton;