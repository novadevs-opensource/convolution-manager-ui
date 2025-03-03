// src/components/agent/buttons/Button.tsx
import React, { ReactNode } from 'react';

interface ButtonProps {
  onClick: () => void;
  label: string;
  icon?: string | ReactNode;
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
  const buttonClass = 'inline-flex py-2 lg:px-14 px-9 shadow-md font-normal font-afacad uppercase justify-center rounded-full border-2 border-black transition-colors bg-black-dark items-center gap-2';
  
  return (
    <button 
      className={`${buttonClass} ${disabled ? 'bg-gray-300 border-gray-500 text-gray-500 cursor-not-allowed text-black' : 'hover:bg-white hover:text-black hover:border-black text-white'} ${className} text-sm`}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{label}</span> 
      {icon && typeof icon === 'string' && <i className={`fa-solid ${icon}`}></i>}
      {icon && typeof icon === 'object' && icon}
    </button>
  );
};

export default Button;
