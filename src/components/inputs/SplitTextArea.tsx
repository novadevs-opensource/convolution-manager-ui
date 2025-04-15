import React, { useState, useEffect, forwardRef } from 'react';
import { splitIntoSentences } from '../../utils/character';

interface SplitTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string[]; // Value as an array of sentences
  onChange: (newValue: string[]) => void; // Callback to update the value (array)
  placeholder?: string;
  id?: string;
  splitOnBlur?: boolean; // If true, splitOnBlur is applied; if false, the content is sent as is
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
  // Local state to maintain the text in string format
  const [text, setText] = useState<string>(value?.join('\n') || '');
  // We use an additional state to control if we are actively typing
  const [isTyping, setIsTyping] = useState(false);

  // Update local state if the value in props changes (for example, when loading a backup)
  useEffect(() => {
    setText(value?.join('\n') || '');
  }, [value]);

  // Handle blur event to apply the split
  const handleBlur = () => {
    setIsTyping(false);
    if (splitOnBlur) {
      try {
        const newArray = splitIntoSentences(text);
        onChange(newArray);
      } catch (error) {
        console.error("Error splitting text:", error);
        // If there's an error, at least preserve the complete text
        onChange([text]);
      }
    } else {
      onChange([text]);
    }
  };
  
  // Handle change event to update the local state without splitting
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsTyping(true);
    setText(e.target.value);
  };

  // Apply the effect to split only when we finish typing
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (!isTyping && text) {
      timer = setTimeout(() => {
        if (splitOnBlur) {
          try {
            const newArray = splitIntoSentences(text);
            onChange(newArray);
          } catch (error) {
            console.error("Error splitting text:", error);
            onChange([text]);
          }
        } else {
          onChange([text]);
        }
      }, 500); // Delay to avoid too many calls
    }
    
    // Always return a cleanup function
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isTyping, text, splitOnBlur, onChange]);

  const renderLabel = () => {
    if (customLabel) {
      return customLabel;
    }
    if (label) {
      return (
        <label htmlFor={id} className="block font-medium mb-2 text-lg">
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
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => setIsTyping(true)}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={`
            placeholder:text-beige-600 w-full px-4 py-2 rounded-md resize-y !bg-beige-50
            ${isInvalid ? 'bg-red-100 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            ${iconSource ? 'pl-10' : ''}
            ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
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

// ErrorPill component
interface ErrorPillProps {
  children: React.ReactNode;
}

const ErrorPill = ({ children }: ErrorPillProps) => {
  return (
    <div className="text-sm text-red-500 mt-1">{children}</div>
  );
};

export default SplitTextArea;