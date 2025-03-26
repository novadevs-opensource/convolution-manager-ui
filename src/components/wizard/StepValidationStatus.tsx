import React from 'react';

export interface ValidationStatusItem {
  name: string;
  isValid: boolean;
  message?: string;
}

export interface ValidationStatusProps {
  isValid: boolean;
  message?: string;
  validationItems?: ValidationStatusItem[];
  errors?: Record<string, string | string[]>;
  showDetails?: boolean;
  isValidating?: boolean;
}

/**
 * Component for displaying validation status
 */
const StepValidationStatus: React.FC<ValidationStatusProps> = ({
  isValid,
  message,
  validationItems = [],
  errors = {},
  showDetails = false,
  isValidating = false
}) => {
  // Function to convert errors in object format to ValidationStatusItems
  const getErrorItems = (): ValidationStatusItem[] => {
    if (!errors || Object.keys(errors).length === 0) {
      return [];
    }

    return Object.entries(errors).map(([field, errorMessages]) => {
      // If errorMessages is an array, convert to string
      const errorMessage = Array.isArray(errorMessages) ? errorMessages.join(', ') : errorMessages;
      
      // Convert field from camelCase or snake_case to a readable format
      const readableField = field
        .replace(/([A-Z])/g, ' $1') // camelCase to spaces
        .replace(/_/g, ' ') // snake_case to spaces
        .replace(/^\w/, c => c.toUpperCase()); // First letter uppercase
      
      return {
        name: readableField,
        isValid: false,
        message: errorMessage
      };
    });
  };

  // Combine explicit validation items and derived error items
  if (getErrorItems().length > 0) {
    console.warn(getErrorItems());
  }
  const allValidationItems = [...validationItems];
  
  // If validating, show loading indicator
  if (isValidating) {
    return (
      <div className="flex items-center text-gray-500 space-x-2 mt-2">
        <i className="fa-solid fa-sync fa-spin"></i>
        <span>Validating...</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 mb-4 ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
      <div className="flex items-center">
        {isValid ? (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
            <i className="fa-solid fa-check text-green-500"></i>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
            <i className="fa-solid fa-exclamation-circle text-red-500"></i>
          </div>
        )}
        <div>
          <h4 className={`font-anek-latin font-bold ${isValid ? 'text-green-700' : 'text-red-700'}`}>
            {isValid ? 'Validation passed' : 'There are issues to resolve'}
          </h4>
          {message && !message.startsWith('{') && !message.startsWith('[') && (
            <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
          )}
        </div>
      </div>

      {showDetails && allValidationItems.length > 0 && (
        <div className="mt-3 ml-10">
          <ul className="space-y-1">
            {allValidationItems.map((item, index) => (
              <li key={index} className="flex items-start">
                {item.isValid ? (
                  <i className="fa-solid fa-check text-green-500 mr-2 mt-1"></i>
                ) : (
                  <i className="fa-solid fa-times text-red-500 mr-2 mt-1"></i>
                )}
                <div className="flex-1">
                  <span className={`text-sm font-anek-latin ${item.isValid ? 'text-green-700' : 'text-red-700'}`}>
                    {item.name}
                  </span>
                  {!item.isValid && item.message && (
                    <p className="text-sm text-red-600 mt-0.5">— {item.message}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StepValidationStatus;