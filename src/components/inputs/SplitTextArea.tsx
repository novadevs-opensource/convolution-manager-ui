import React, { useState, useEffect, forwardRef } from 'react';
import { splitIntoSentences } from '../../utils/character';

interface SplitTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string[]; // Valor como array de oraciones
  onChange: (newValue: string[]) => void; // Callback para actualizar el valor (array)
  placeholder?: string;
  id?: string;
  splitOnBlur?: boolean; // Si es true, se aplica splitOnBlur; si es false, se envía el contenido tal cual
  label?: string;
  hasError?: boolean;
  errorMessages?: Array<string>;
  customLabel?: React.ReactNode;
  plain?: boolean;
  errorPosition?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  iconSource?: React.ReactNode;
}

const SplitTextArea = forwardRef<HTMLTextAreaElement, SplitTextAreaProps>(({
  value,
  onChange,
  placeholder,
  id,
  splitOnBlur = true,
  label,
  hasError,
  errorMessages,
  customLabel,
  plain = false,
  errorPosition = false,
  required = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  iconSource,
  className,
  ...props
}, ref) => {
  // Estado local para mantener el texto en formato de cadena
  const [text, setText] = useState<string>(value?.join('\n'));

  // Actualiza el estado local si el valor en props cambia (por ejemplo, al cargar un backup)
  useEffect(() => {
    setText(value?.join('\n'));
  }, [value]);

  // En onBlur, se transforma el texto (si corresponde) y se notifica al padre
  const handleBlur = () => {
    if (splitOnBlur) {
      const newArray = splitIntoSentences(text);
      onChange(newArray);
    } else {
      // Si no se desea dividir, se pasa el texto completo como un único elemento del array
      onChange([text]);
    }
  };

  const renderLabel = () => {
    if (customLabel) {
      return customLabel;
    }
    if (label) {
      return (
        <label htmlFor={id} className="block font-medium mb-1">
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
        <div className="mt-1">
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
      const currentLength = text.length;
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

  const isInvalid = hasError || (required && !text);

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
          id={id}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-4 py-2 rounded-md resize-y
            ${isInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            ${iconSource ? 'pl-10' : ''}
            ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
            ${plain ? 'border' : 'border shadow-sm'}
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
    <div className="text-sm text-red-500 mt-1">{children}</div>
  );
};

export default SplitTextArea;