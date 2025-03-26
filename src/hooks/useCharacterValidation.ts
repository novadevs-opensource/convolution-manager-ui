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

  const validateClientCredentials = useCallback(async (
    clientType: 'telegram' | 'twitter',
    credentials: any
  ): Promise<ValidationResult> => {
    return validate(
      { credentials },
      { specialValidationType: `${clientType}Credentials` },
      `${clientType}Credentials` as ValidationSectionKey
    );
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