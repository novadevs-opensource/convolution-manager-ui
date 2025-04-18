import React, { forwardRef } from 'react';

export interface GenericTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  iconSource?: React.ReactNode;
  label?: string;
  hasError?: boolean;
  errorMessages?: Array<string>;
  customLabel?: React.ReactNode;
  plain?: boolean;
  disabled?: boolean;
  errorPosition?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  name?: string;
}

const GenericTextArea = forwardRef<HTMLTextAreaElement, GenericTextAreaProps>(({
  value = '',
  onChange,
  placeholder,
  iconSource,
  label,
  hasError,
  errorMessages,
  customLabel,
  plain,
  disabled,
  errorPosition = false,
  required = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  className,
  name,
  ...props
}, ref) => {
  
  const renderLabel = () => {
    if (customLabel) {
      return customLabel;
    }
    if (label) {
      return (
        <label htmlFor={name} className="block font-md mb-1 text-lg">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      );
    }
    return null;
  };

  const renderErrorPills = () => {
    if (errorMessages && errorMessages.length > 0) {
      return (
        <div className="mb-1">
          {errorMessages.map((error, index) => (
            <ErrorPill key={index}>{error}</ErrorPill>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderIcon = () => {
    if (hasError) {
      return (
        <div className="absolute top-2 right-2 pointer-events-none">
          <span className="text-red-500">⚠️</span>
        </div>
      );
    }

    if (iconSource) {
      return (
        <div className="absolute top-2 left-2 pointer-events-none">
          {iconSource}
        </div>
      );
    }

    return null;
  };

  const renderCharCount = () => {
    if (showCharCount && maxLength) {
      const currentLength = value.length;
      const isNearLimit = currentLength > maxLength * 0.8;
      const isAtLimit = currentLength >= maxLength;
      
      return (
        <div className={`text-xs mt-1 text-right ${
          isAtLimit ? 'text-red-500' : 
          isNearLimit ? 'text-yellow-500' : 
          'text-gray-500'
        }`}>
          {currentLength}/{maxLength}
        </div>
      );
    }
    return null;
  };

  const isInvalid = hasError || (required && !value);

  return (
    <div className="w-full mb-4">
      {(label || customLabel) && (
        <div className="flex justify-between items-center">
          {renderLabel()}
          {!errorPosition && renderErrorPills()}
        </div>
      )}
      
      {errorPosition && (
        <div className="mb-1">
          {renderErrorPills()}
        </div>
      )}
      
      <div className="relative">
        {renderIcon()}
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          name={name}
          id={name}
          className={`
            placeholder:text-beige-600 w-full px-4 py-2 rounded-md resize-y bg-beige-50 hover:border-gray-200
            ${isInvalid ? 'bg-red-100 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'}
            ${iconSource ? 'pl-10' : ''}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
            ${plain ? 'border border-beige-50' : 'border shadow-md'}
            ${className || ''}
          `}
          {...props}
        />
        {renderCharCount()}
      </div>
    </div>
  );
});

// Componente ErrorPill
interface ErrorPillProps {
  children: React.ReactNode;
}

const ErrorPill = ({ children }: ErrorPillProps) => {
  return (
    <div className="text-sm text-red-500">{children}</div>
  );
};

export default GenericTextArea;