// src/components/agent/buttons/Button.tsx
import React, { ReactNode } from 'react';

interface ButtonProps {
  onClick: () => void;
  label?: string;
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
  const buttonClass = 'flex flex-row min-w[120px] py-2 px-6 gap-4 font-normal font-afacad uppercase justify-start items-center rounded-md border-2 border-yellow-500 transition-colors bg-yellow-500';
  
  return (
    <button 
      className={`${buttonClass} ${disabled ? '!bg-gray-300 !border-gray-300 border-gray-500 text-gray-500 cursor-not-allowed text-black' : 'hover:bg-black hover:text-yellow-500 hover:border-black text-black font-anek-latin'} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && typeof icon === 'string' && <i className={`fa-solid ${icon} min-w-[15px]`}></i>}
      {icon && typeof icon === 'object' && icon}
      {label && <span>{label}</span>}

    </button>
  );
};

export default Button;
