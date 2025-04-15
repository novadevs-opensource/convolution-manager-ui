import React, { forwardRef } from 'react';

export interface GenericTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string;
    name?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    iconSource?: React.ReactNode;
    label?: string;
    hasError?: boolean;
    errorMessages?: Array<string>;
    customLabel?: React.ReactNode;
    plain?: boolean;
    disabled?: boolean;
    errorPosition?: boolean;
    required?: boolean; // Añadido para marcar campos obligatorios
    containerClassName?: string;
}

const GenericTextInput = forwardRef<HTMLInputElement, GenericTextInputProps>(({
    value,
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
    className,
    name,
    containerClassName,
    ...props
}, ref) => {
    
    const renderLabel = () => {
        if (customLabel) {
            return customLabel;
        }
        if (label) {
            return (
                <label htmlFor={name ?? ''} className="block text-lg items-center flex flex-row mb-1">
                    <span>{label}</span>
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            );
        }
        return null;
    };

    const renderErrorPills = () => {
        if (errorMessages && errorMessages.length > 0) {
            return (
                <div className="flex flex-col">
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
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-red-500">⚠️</span>
                </div>
            );
        }

        if (iconSource) {
            return (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {iconSource}
                </div>
            );
        }

        return null;
    };

    const isInvalid = hasError || (required && !value);

    return (
        <div className={`w-full mb-4 ${containerClassName}`}>
            {(label || customLabel) && (
                <div className="flex flex-row justify-between items-center">
                    {renderLabel()}
                </div>
            )}
            
            {errorPosition && (
                <div className="mb-1">
                    {renderErrorPills()}
                </div>
            )}
            
            <div className="relative">
                {renderIcon()}
                <input
                    ref={ref}
                    type="text"
                    value={value}
                    name={name}
                    id={name}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`
                        placeholder:text-beige-600 w-full px-4 py-2 rounded-md bg-beige-50 hover:border-gray-200
                        ${plain ? 'border border-beige-50' : 'border shadow-md'}
                        ${isInvalid ? 'placeholder:text-red-300 border-red-50 bg-red-100 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'}
                        ${iconSource ? 'pl-10' : ''}
                        ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                        ${className || ''}
                    `}
                    {...props}
                />
            </div>
            {!errorPosition && renderErrorPills()}
        </div>
    );
});

// Componente ErrorPill simplificado
interface ErrorPillProps {
    children: React.ReactNode;
}

const ErrorPill = ({ children }: ErrorPillProps) => {
    return (
        <div className="text-sm text-red-500 mt-1">{children}</div>
    );
};

export default GenericTextInput;