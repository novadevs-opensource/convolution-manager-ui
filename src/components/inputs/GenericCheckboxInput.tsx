import React, { forwardRef } from 'react';

// Interfaz de props para el nuevo componente
export interface GenericCheckboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  hasError?: boolean;
  errorMessages?: Array<string>;
  customLabel?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  errorPosition?: boolean; // similar a otros componentes, por si quieres controlar la posición del error
}

const GenericCheckboxInput = forwardRef<HTMLInputElement, GenericCheckboxInputProps>(({
  checked = false,
  onChange,
  label,
  hasError,
  errorMessages = [],
  customLabel,
  disabled,
  required = false,
  name,
  className,
  errorPosition = false,
  ...props
}, ref) => {
  
  // Función para renderizar etiqueta con asterisco de requerido
  const renderLabel = () => {
    if (customLabel) {
      return customLabel;
    }
    if (label) {
      return (
        <label htmlFor={name ?? ''} className="block font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      );
    }
    return null;
  };

  // Renderizado de mensajes de error al estilo "píldoras"
  const renderErrorPills = () => {
    if (errorMessages.length > 0) {
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

  // Para mantener coherencia con la lógica de "campo requerido" en otros inputs.
  // En checkboxes puede ser opcional o interpretarse de otra forma, pero se deja
  // igual para que esté en línea con el resto de tus componentes.
  const isInvalid = hasError || (required && !checked);

  return (
    <div className="w-full mb-4">
      {/* Si el label o el customLabel existen, renderizamos la sección con la etiqueta */}
      {(label || customLabel) && (
        <div className="flex justify-between items-center mb-1">
          {renderLabel()}
          {/* Si no quieres mostrar los errores a la derecha del label, lo dejas como en GenericTextInput */}
          {!errorPosition && renderErrorPills()}
        </div>
      )}

      {/* Si prefieres el error antes del checkbox, puedes cambiar esto */}
      {errorPosition && (
        <div className="mb-1">
          {renderErrorPills()}
        </div>
      )}

      {/* Contenedor del checkbox */}
      <div className="flex items-center">
        <input
          ref={ref}
          id={name ?? ''}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            rounded border-gray-300 text-blue-600 shadow-sm
            focus:ring-blue-500 focus:border-blue-500
            ${isInvalid ? 'border-red-500 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            mr-2
            ${className ?? ''}
          `}
          {...props}
        />
        {/* Renderiza el label a la derecha del checkbox si así lo prefieres */}
        {!label && customLabel && customLabel}
        {/* Si quieres mostrar el texto de la etiqueta también a la derecha del checkbox 
            (en lugar de la sección superior), podrías hacer algo como: 
              {label && <span>{label}{required && '*'}</span>}
            en caso de que no quieras la etiqueta arriba.
        */}
      </div>

      {/* Si prefieres los errores debajo del checkbox, puedes ponerlos aquí */}
      {errorPosition && renderErrorPills()}
    </div>
  );
});

interface ErrorPillProps {
  children: React.ReactNode;
}

const ErrorPill = ({ children }: ErrorPillProps) => {
  return (
    <div className="text-sm text-red-500 mt-1">{children}</div>
  );
};

export default GenericCheckboxInput;
