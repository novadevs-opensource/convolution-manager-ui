// src/components/agent/buttons/SaveAgentButton.tsx
import React from 'react';
import Button from '../../common/Button';

interface SaveAgentButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  hasCharacterData?: boolean;
  showAlways?: boolean;
}

/**
 * Button to save an agent - UI only
 */
const SaveAgentButton: React.FC<SaveAgentButtonProps> = ({ 
  onClick, 
  className = '',
  disabled = false,
  loading = false,
  hasCharacterData = false,
  showAlways = false
}) => {
  // Visibility logic - show if criteria met or showAlways is true
  const shouldShow = showAlways || hasCharacterData;
  
  if (!shouldShow) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      label={loading ? "Saving settings..." : "Save settings"}
      icon={loading ? "fa-spinner fa-spin" : "fa-save"}
      disabled={disabled || loading}
      className={className}
    />
  );
};

export default SaveAgentButton;