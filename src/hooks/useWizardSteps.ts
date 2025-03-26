import { useState } from 'react';

/**
 * Custom hook for managing wizard navigation and steps
 */
export function useWizardSteps(initialStep = 0, totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  /**
   * Navigate to the next step if not on the last step
   */
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  /**
   * Navigate to the previous step if not on the first step
   */
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  /**
   * Navigate to a specific step by index
   */
  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };
  
  // Helper properties
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  return {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isFirstStep,
    isLastStep
  };
}