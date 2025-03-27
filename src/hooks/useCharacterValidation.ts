// src/hooks/useCharacterValidation.ts
import { useState, useCallback } from 'react';
import api from '../services/apiClient';
import { ValidationStatusItem } from '../components/wizard/StepValidationStatus';

// Types for validation
interface ValidationResponse {
  success: boolean;
  message?: string;
  validationItems?: ValidationStatusItem[];
  errors?: Record<string, string | string[]>;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  validationItems: ValidationStatusItem[];
  errors?: Record<string, string | string[]>;
}

export type ValidationSectionKey = 
  | 'basicInfo' 
  | 'clientConfig' 
  | 'details' 
  | 'examples' 
  | 'attributes' 
  | 'fullCharacter' 
  | `${string}Credentials`;

  interface ValidationConfig {
    requiredFields?: string[];
    dependencies?: {
      clients?: string[];
      fields?: string[];
    };
    fieldRules?: Record<string, string>;
    fieldLabels?: Record<string, string>;
    specialValidationType?: string; // Añadimos esta propiedad
  }

/**
 * Custom hook for handling character validation through the API
 */
export function useCharacterValidation() {
  const [validating, setValidating] = useState<boolean>(false);
  const [validatingSection, setValidatingSection] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Format the validation response from the API into a consistent result object
   */
  const formatValidationResult = useCallback((response: ValidationResponse): ValidationResult => {
    return {
      isValid: response.success,
      message: response.message || (response.success ? 'Validation successful' : 'Validation failed'),
      validationItems: response.validationItems || [],
      errors: response.errors
    };
  }, []);

  /**
   * Handle validation API errors
   */
  const handleApiError = useCallback((error: any, _type: string): ValidationResult => {
    const errorMsg = error.response?.data?.message || 
                    error.response?.data?.errors || 
                    'Validation failed';
    
    const formattedError = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);
    setValidationError(formattedError);
    
    // Extract validation items from error response
    const validationItems = error.response?.data?.validationItems || [];
    
    // Extract raw error objects for better display
    const errors = error.response?.data?.errors || {};
    
    return {
      isValid: false,
      message: formattedError,
      validationItems,
      errors
    };
  }, []);

  /**
   * Unified validate method that replaces all the specific validation methods
   */
  const validate = useCallback(async (
    data: any,
    config: ValidationConfig,
    sectionKey: ValidationSectionKey
  ): Promise<ValidationResult> => {
    setValidating(true);
    setValidatingSection(sectionKey);
    setValidationError(null);
    
    try {
      // Determinar si es una validación especial
      let apiEndpoint = '/character/validate';
      let apiData: any = { data, config };
      
      // Comprobar si es una validación de credenciales
      if (sectionKey.endsWith('Credentials')) {
        // Configurar la validación especial
        apiData.config.specialValidationType = sectionKey;
        
        // Si es Telegram o Twitter, formatear los datos correctamente
        if (sectionKey === 'telegramCredentials' && data.credentials) {
          // Formato específico para validación de Telegram
        } else if (sectionKey === 'twitterCredentials' && data.credentials) {
          // Formato específico para validación de Twitter
        }
      }
      
      const { data: responseData } = await api.post(apiEndpoint, apiData);
      
      const result = formatValidationResult(responseData);
      setValidationResults(prev => ({ ...prev, [sectionKey]: result }));
      return result;
    } catch (error: any) {
      const result = handleApiError(error, sectionKey);
      setValidationResults(prev => ({ ...prev, [sectionKey]: result }));
      return result;
    } finally {
      setValidating(false);
      setValidatingSection(null);
    }
  }, [formatValidationResult, handleApiError]);

  /**
   * Validate client credentials
   */
  const validateClientCredentials = useCallback(async (
    clientType: 'telegram' | 'twitter',
    credentials: any
  ): Promise<ValidationResult> => {
    console.log(`Validating ${clientType} credentials:`, credentials);
    
    // Verificaciones básicas antes de llamar al backend
    if (clientType === 'telegram') {
      // Si no hay token o es un objeto en lugar de un string (como vemos en los logs)
      if (!credentials.token || typeof credentials.token !== 'string' || credentials.token === '') {
        console.warn('Telegram token validation failed: Missing or invalid token');
        
        // Devolver error inmediatamente sin llamar al backend
        return {
          isValid: false,
          message: 'Telegram bot token is required',
          validationItems: [{
            name: 'Telegram Bot Token',
            isValid: false,
            message: 'Bot token is required'
          }],
          errors: {
            'token': 'Bot token is required'
          }
        };
      }
    } else if (clientType === 'twitter') {
      // Verificar credenciales de Twitter
      const missingFields = [];
      if (!credentials.username) missingFields.push('Username');
      if (!credentials.password) missingFields.push('Password');
      if (!credentials.email) missingFields.push('Email');
      
      if (missingFields.length > 0) {
        console.warn(`Twitter credentials validation failed: Missing ${missingFields.join(', ')}`);
        
        // Crear errores para cada campo faltante
        const errors: Record<string, string> = {};
        const validationItems: ValidationStatusItem[] = [];
        
        missingFields.forEach(field => {
          const lowerField = field.toLowerCase();
          errors[lowerField] = `${field} is required`;
          validationItems.push({
            name: `Twitter ${field}`,
            isValid: false,
            message: `${field} is required`
          });
        });
        
        return {
          isValid: false,
          message: 'Twitter credentials are incomplete',
          validationItems,
          errors
        };
      }
    }
    
    // Preparar sección y tipo de validación
    const sectionKey = `${clientType}Credentials` as ValidationSectionKey;
    
    // Determinar estructura si se proporciona
    const structure = credentials.structure || null;
    
    // Eliminar 'structure' si existe para no enviarlo como credencial
    if (credentials.structure) {
      const { structure: _, ...credentialsWithoutStructure } = credentials;
      credentials = credentialsWithoutStructure;
    }
    
    // Reglas específicas según el tipo de cliente
    const fieldRules: Record<string, string> = {};
    const fieldLabels: Record<string, string> = {};
    
    if (clientType === 'telegram') {
      fieldRules['token'] = 'required|string';
      fieldLabels['token'] = 'Telegram Bot Token';
    } else if (clientType === 'twitter') {
      fieldRules['username'] = 'required|string';
      fieldRules['password'] = 'required|string';
      fieldRules['email'] = 'required|email';
      
      fieldLabels['username'] = 'Twitter Username';
      fieldLabels['password'] = 'Twitter Password';
      fieldLabels['email'] = 'Twitter Email';
    }
    
    // Configurar datos de validación
    const validationData = structure 
      ? { [structure]: { [clientType === 'telegram' ? 'TELEGRAM_BOT_TOKEN' : '']: credentials.token } }
      : { credentials };
    
    try {
      // Delegar al método principal
      const result = await validate(
        validationData,
        { 
          specialValidationType: sectionKey,
          fieldRules,
          fieldLabels
        },
        sectionKey
      );
      
      // Logging avanzado para depuración
      console.log(`${clientType} validation result:`, {
        isValid: result.isValid,
        hasErrors: result.errors ? Object.keys(result.errors).length > 0 : false,
        errorsKeys: result.errors ? Object.keys(result.errors) : [],
        itemsCount: result.validationItems.length
      });
      
      return result;
    } catch (error) {
      console.error(`Error validating ${clientType} credentials:`, error);
      
      // Devolver error genérico
      return {
        isValid: false,
        message: `Error validating ${clientType} credentials`,
        validationItems: [{
          name: clientType === 'telegram' ? 'Telegram Bot Token' : 'Twitter Credentials',
          isValid: false,
          message: 'Validation error occurred'
        }],
        errors: {
          'validation': 'Error during validation process'
        }
      };
    }
  }, [validate]);

  /**
   * Get cached validation result for a specific section
   */
  const getValidationResult = useCallback((section: ValidationSectionKey): ValidationResult | null => {
    return validationResults[section] || null;
  }, [validationResults]);

  /**
   * Reset all validation results
   */
  const resetValidation = useCallback(() => {
    setValidationResults({});
    setValidationError(null);
  }, []);

  /**
   * Check if a specific section is currently being validated
   */
  const isSectionValidating = useCallback((section: ValidationSectionKey): boolean => {
    return validating && validatingSection === section;
  }, [validating, validatingSection]);

  return {
    validate,
    getValidationResult,
    validateClientCredentials,
    validating,
    validationError,
    validationResults,
    resetValidation,
    isSectionValidating
  };
}