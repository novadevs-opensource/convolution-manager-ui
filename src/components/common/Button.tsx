// src/components/agent/buttons/Button.tsx
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  label: string;
  icon?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Base button component for agent actions
 * Pure UI component with no business logic
 */
const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  label, 
  icon,
  disabled = false,
  className = ''
}) => {
  const buttonClass = 'inline-flex py-2 lg:px-14 px-9 shadow-md font-normal font-afacad uppercase justify-center rounded-full border-2 border-black transition-colors bg-black-dark text-white hover:bg-white hover:text-black items-center gap-2';
  
  return (
    <button 
      className={`${buttonClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label} {icon && <i className={`fa-solid ${icon}`}></i>}
    </button>
  );
};

export default Button;