// src/hooks/useWizardValidation.ts
import { useCallback, useEffect, useState, useRef } from 'react';
import { CharacterData } from '../types';
import { ValidationResult, ValidationSectionKey, useCharacterValidation } from './useCharacterValidation';
import { SpecialValidation, WIZARD_STEPS_CONFIG, WizardStepConfig } from '../config/wizardStepConfig';

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
   * Validate a specific step based on its configuration
   */
  const validateStep = useCallback(async (stepIndex: number): Promise<boolean> => {
    const stepConfig: WizardStepConfig = WIZARD_STEPS_CONFIG[stepIndex];
    
    // Skip validation if specified
    if (stepConfig.skipValidation) {
      setInitialValidationDone(prev => {
        const updated = [...prev];
        updated[stepIndex] = true;
        return updated;
      });
      return true;
    }
    
    /* 
      Check for required fields before to send to backend. Unless programming 
      error, all of them are always be pressent because of the data placeholders or
      configuration mistake
    */
    if (stepConfig.dependencies?.fields) {
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
      // If some required field is not present return false and mark validation as done.
      if (!allFieldsPresent) {
        setInitialValidationDone(prev => {
          const updated = [...prev];
          updated[stepIndex] = true;
          return updated;
        });
        return false;
      }
    }

    // Handle client-specific validations
    if (stepConfig.specialValidations && character.clients) {
      for (const client of character.clients) {
        if (stepConfig.specialValidations[client]) {
          const specialConfig: SpecialValidation = stepConfig.specialValidations[client];

          // Telegram token validation
          if (client === 'telegram' && specialConfig.type === 'telegramCredentials') {
            let token = character.settings.secrets.TELEGRAM_BOT_TOKEN
            const credentialsResult = await validation.validateClientCredentials('telegram', { token });
            setStepValidationResults(prev => {
              const newResults = [...prev];
              newResults[stepIndex] = credentialsResult;
              return newResults;
            });

            if (!credentialsResult.isValid) {
              setInitialValidationDone(prev => {
                const updated = [...prev];
                updated[stepIndex] = true;
                return updated;
                });
              return false;
            }
          }
          
          // Twitter credentials validation
          if (client === 'twitter' && specialConfig.type === 'twitterCredentials') {
            const fieldPaths = specialConfig.fieldPaths || [];
            const credentials: Record<string, string> = {};
            
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
              
              if (field.includes('USERNAME')) credentials.username = value;
              else if (field.includes('PASSWORD')) credentials.password = value;
              else if (field.includes('EMAIL')) credentials.email = value;
            }
            
            if (credentials.username && credentials.password && credentials.email) {
              const credentialsResult = await validation.validateClientCredentials('twitter', credentials);
              
              setStepValidationResults(prev => {
                const newResults = [...prev];
                newResults[stepIndex] = credentialsResult;
                return newResults;
              });
              
              if (!credentialsResult.isValid) {
                setInitialValidationDone(prev => {
                  const updated = [...prev];
                  updated[stepIndex] = true;
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
          updated[stepIndex] = true;
          return updated;
        });
        return true;
      }

      // Call the unified validate method
      const result = await validation.validate(data, validationConfig, sectionKey);
      
      // Save the validation result
      setStepValidationResults(prev => {
        const newResults = [...prev];
        newResults[stepIndex] = result;
        return newResults;
      });
      
      // Mark as validated initially
      setInitialValidationDone(prev => {
        const updated = [...prev];
        updated[stepIndex] = true;
        return updated;
      });
      
      return result.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      setInitialValidationDone(prev => {
        const updated = [...prev];
        updated[stepIndex] = true;
        return updated;
      });
      return false;
    }
  }, [character, selectedModelValue, validation]);

  /**
   * Validate the current step based on its configuration
   */
  const validateCurrentStep = useCallback(async () => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  /**
   * Validate all steps up to the current step
   */
  const validateAllPreviousSteps = useCallback(async () => {
    const results: boolean[] = [];
    
    // Skip first step if it has a name (generation step)
    const startStep = character.name?.trim() ? 1 : 0;
    
    for (let i = startStep; i < currentStep; i++) {
      // Skip validating steps that don't need validation
      if (WIZARD_STEPS_CONFIG[i].skipValidation) {
        results.push(true);
        continue;
      }
      
      const isValid = await validateStep(i);
      results.push(isValid);
    }
    
    return results.every(result => result === true);
  }, [currentStep, validateStep, character.name]);
  
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

  /**
   * Validate steps in a specified range
   */
  const validateStepRange = useCallback(async (startStep: number, endStep: number) => {
    const results: boolean[] = [];
    
    for (let i = startStep; i <= endStep; i++) {
      if (i >= WIZARD_STEPS_CONFIG.length) break;
      
      // Skip validating steps that don't need validation
      if (WIZARD_STEPS_CONFIG[i].skipValidation) {
        results.push(true);
        continue;
      }
      
      const isValid = await validateStep(i);
      results.push(isValid);
    }
    
    return results;
  }, [validateStep]);

  /**
   * Reset validation for a specific step or all steps
   */
  const resetValidation = useCallback((step?: number) => {
    if (step !== undefined) {
      // Reset a specific step
      setStepValidationResults(prev => {
        const newResults = [...prev];
        delete newResults[step];
        return newResults;
      });
      
      setInitialValidationDone(prev => {
        const updated = [...prev];
        updated[step] = false;
        return updated;
      });
    } else {
      // Reset all steps
      setStepValidationResults([]);
      setInitialValidationDone([]);
    }
  }, []);

  /**
   * Get an array of invalid steps up to the current one
   */
  const getInvalidSteps = useCallback(() => {
    const invalidSteps: number[] = [];
    
    for (let i = 0; i < currentStep; i++) {
      // Skip steps that don't need validation
      if (WIZARD_STEPS_CONFIG[i].skipValidation) continue;
      
      // Get validation result for this step
      const validationResult = getStepValidation(i);
      
      // If validation is not done or failed, add to invalid steps
      if (!initialValidationDone[i] || !validationResult.isValid) {
        invalidSteps.push(i);
      }
    }
    
    return invalidSteps;
  }, [currentStep, getStepValidation, initialValidationDone]);

  return {
    validateCurrentStep,
    validateStep,
    validateAllPreviousSteps,
    validateStepRange,
    getStepValidation,
    canProceedToNextStep,
    isValidating: validation.validating,
    isSectionValidating: validation.isSectionValidating,
    initialValidationDone,
    getInvalidSteps,
    resetValidation
  };
}