// src/hooks/useWizardValidation.ts
import { useCallback, useEffect, useState, useRef } from 'react';
import { CharacterData } from '../types';
import { ValidationResult, ValidationSectionKey, useCharacterValidation } from './useCharacterValidation';
import { WIZARD_STEPS_CONFIG } from '../config/wizardStepConfig';

/**
 * Custom hook to handle validation for each wizard step
 */
export function useWizardValidation(
  character: CharacterData,
  selectedModelValue: string,
  currentStep: number
) {
  const validation = useCharacterValidation();
  const [stepValidationResults, setStepValidationResults] = useState<ValidationResult[]>([]);
  const [initialValidationDone, setInitialValidationDone] = useState<boolean[]>([]);
  const lastCharacterRef = useRef<string>('');
  const lastModelRef = useRef<string>('');

  /**
   * Validate the current step based on its configuration
   */
  const validateCurrentStep = useCallback(async () => {
    const stepConfig = WIZARD_STEPS_CONFIG[currentStep];
    
    // Skip validation if specified
    if (stepConfig.skipValidation) {
      setInitialValidationDone(prev => {
        const updated = [...prev];
        updated[currentStep] = true;
        return updated;
      });
      return true;
    }
    
    // Check for required fields
    if (stepConfig.dependencies?.fields) {
      /* 
        TODO: This system is not valid, because all fields 
        are always present. We need to validate it to the backend
      */
      const allFieldsPresent = stepConfig.dependencies.fields.every(field => {
        if (field.includes('.')) {
          const parts = field.split('.');
          let obj = character as any;
          for (const part of parts) {
            if (!obj || obj[part] === undefined) return false;
            obj = obj[part];
          }
          return true;
        }
        return character[field as keyof CharacterData] !== undefined;
      });
      
      if (!allFieldsPresent) {
        setInitialValidationDone(prev => {
          const updated = [...prev];
          updated[currentStep] = true;
          return updated;
        });
        return false;
      }
    }

    if (stepConfig.specialValidations && character.clients) {
      /*
        TODO: 
          - Use types and interfaces
          - Try to validate every field against the backend
      */
      for (const client of character.clients) {
        if (stepConfig.specialValidations[client]) {
          const specialConfig = stepConfig.specialValidations[client];

          // Para validaciones de token de Telegram
          if (client === 'telegram' && specialConfig.type === 'telegramCredentials') {
            const tokenPath = specialConfig.fieldPath;
            let token = '';
            
            // Obtener el token del path especificado
            if (tokenPath && tokenPath.includes('.')) {
              const parts = tokenPath.split('.');
              let obj = character as any;
              for (const part of parts) {
                if (!obj || obj[part] === undefined) break;
                obj = obj[part];
              }
              token = obj;
            }
            
            if (token) {
              // Validar las credenciales de Telegram
              const credentialsResult = await validation.validateClientCredentials('telegram', { token });
              
              // Guardar el resultado para este paso
              setStepValidationResults(prev => {
                const newResults = [...prev];
                newResults[currentStep] = credentialsResult;
                return newResults;
              });
              
              // Si falla, marcar como validado pero devolver false
              if (!credentialsResult.isValid) {
                setInitialValidationDone(prev => {
                  const updated = [...prev];
                  updated[currentStep] = true;
                  return updated;
                });
                return false;
              }
            }
          }
          
          // Para validaciones de credenciales de Twitter
          if (client === 'twitter' && specialConfig.type === 'twitterCredentials') {
            const fieldPaths = specialConfig.fieldPaths || [];
            const credentials: Record<string, string> = {};
            
            // Obtener cada credencial del path especificado
            for (const path of fieldPaths) {
              let field = path.split('.').pop() || '';
              let value = '';
              
              if (path.includes('.')) {
                const parts = path.split('.');
                let obj = character as any;
                for (const part of parts) {
                  if (!obj || obj[part] === undefined) break;
                  obj = obj[part];
                }
                value = obj;
              }
              
              // Asignar al objeto de credenciales con nombres simplificados
              if (field.includes('USERNAME')) credentials.username = value;
              else if (field.includes('PASSWORD')) credentials.password = value;
              else if (field.includes('EMAIL')) credentials.email = value;
            }
            
            if (credentials.username && credentials.password && credentials.email) {
              // Validar las credenciales de Twitter
              const credentialsResult = await validation.validateClientCredentials('twitter', credentials);
              
              // Guardar el resultado para este paso
              setStepValidationResults(prev => {
                const newResults = [...prev];
                newResults[currentStep] = credentialsResult;
                return newResults;
              });
              
              // Si falla, marcar como validado pero devolver false
              if (!credentialsResult.isValid) {
                setInitialValidationDone(prev => {
                  const updated = [...prev];
                  updated[currentStep] = true;
                  return updated;
                });
                return false;
              }
            }
          }
        }
      }
    }
    
    try {
      // Prepare data with model if needed
      const data = { ...character };
      if (selectedModelValue) {
        data.modelProvider = selectedModelValue;
      }
      
      // Prepare validation config from step config
      const validationConfig = {
        requiredFields: stepConfig.requiredFields || [],
        dependencies: stepConfig.dependencies || {},
        fieldRules: stepConfig.fieldRules || {},
        fieldLabels: stepConfig.fieldLabels || {}
      };
      
      // Use the sectionKey from the step config or derive it
      const sectionKey = stepConfig.validationType || 'generic' as ValidationSectionKey;
      if (!sectionKey) {
        setInitialValidationDone(prev => {
          const updated = [...prev];
          updated[currentStep] = true;
          return updated;
        });
        return true;
      }

      // Call the unified validate method
      const result = await validation.validate(data, validationConfig, sectionKey);
      
      // Save the validation result
      setStepValidationResults(prev => {
        const newResults = [...prev];
        newResults[currentStep] = result;
        return newResults;
      });
      
      // Mark as validated initially
      setInitialValidationDone(prev => {
        const updated = [...prev];
        updated[currentStep] = true;
        return updated;
      });
      
      return result.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      setInitialValidationDone(prev => {
        const updated = [...prev];
        updated[currentStep] = true;
        return updated;
      });
      return false;
    }
  }, [character, selectedModelValue, currentStep, validation]);
  
  /**
   * Automatically validate the current step when it changes
   */
  useEffect(() => {
    // For the first step (prompt), we don't need to validate
    if (currentStep === 0) {
      setInitialValidationDone(prev => {
        const updated = [...prev];
        updated[0] = true;
        return updated;
      });
      return;
    }
    
    validateCurrentStep();
  }, [currentStep]);
  
  /**
   * When character or model changes, validate the current step
   */
  useEffect(() => {
    // Skip for step 0
    if (currentStep === 0) return;
    
    const characterJson = JSON.stringify(character);
    const modelValue = selectedModelValue || '';
    
    // Check if anything has changed
    if (
      characterJson !== lastCharacterRef.current || 
      modelValue !== lastModelRef.current
    ) {
      lastCharacterRef.current = characterJson;
      lastModelRef.current = modelValue;
      
      validateCurrentStep();
    }
  }, [character, selectedModelValue, currentStep]);
  
  /**
   * Get the validation result for the specified step
   */
  const getStepValidation = useCallback((step: number): ValidationResult => {
    // If we have a cached result, use it
    if (stepValidationResults[step]) {
      return stepValidationResults[step];
    }
    
    // Otherwise, provide a default result
    const stepConfig = WIZARD_STEPS_CONFIG[step];
    const validationType = stepConfig.validationType as ValidationSectionKey | undefined;
    if (!validationType) {
      return {
        isValid: true,
        message: 'No validation required for this step',
        validationItems: []
      };
    }
    
    const cachedResult = validation.getValidationResult(validationType);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Default placeholder result - default to false (invalid) instead of true
    return {
      isValid: false,
      message: 'Validation pending',
      validationItems: []
    };
  }, [stepValidationResults, validation]);
  
  /**
   * Check if the current step can proceed (is valid)
   */
  const canProceedToNextStep = useCallback(() => {
    const stepConfig = WIZARD_STEPS_CONFIG[currentStep];
    
    // If no validation is needed, we can proceed
    if (stepConfig.skipValidation) {
      return true;
    }

    // Check if initial validation has been done
    if (!initialValidationDone[currentStep]) {
      return false;
    }
    
    // Check if the step has validation and if it's valid
    if (stepConfig.validationType) {
      const validationResult = getStepValidation(currentStep);
      return validationResult.isValid;
    }
    
    return false;
  }, [currentStep, getStepValidation, initialValidationDone]);

  return {
    validateCurrentStep,
    getStepValidation,
    canProceedToNextStep,
    isValidating: validation.validating,
    isSectionValidating: validation.isSectionValidating,
    initialValidationDone
  };
}