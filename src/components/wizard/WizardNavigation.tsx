// src/components/wizard/WizardNavigation.tsx
import React from 'react';
import Button from '../common/Button';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  canProceed: boolean;
  isProcessing: boolean;
  showSkipButton?: boolean;
  skipButtonDisabled?: boolean;
  className?: string;
  onValidatePrevious?: () => Promise<boolean>;
}

/**
 * Component for rendering wizard navigation controls (prev/next/skip buttons)
 */
const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  canProceed,
  isProcessing,
  showSkipButton = false,
  skipButtonDisabled = false,
  className = '',
  onValidatePrevious
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = async () => {
    // If we have a validation function for previous steps, call it
    if (onValidatePrevious) {
      // Check if all previous steps are valid
      const allValid = await onValidatePrevious();
      
      if (!allValid) {
        // Show error toast or message here if needed
        console.error('Previous steps have validation errors. Please review.'); // TODO: Change by toast
        return;
      }
    }
    
    // If all steps are valid or we don't need to validate, proceed
    onNext();
  };

  return (
    <div className={`flex flex-row gap-2 items-end ${className}`}>
      {!isFirstStep && (
        <Button
          label='Previous'
          onClick={onPrevious}
          disabled={isProcessing || isFirstStep}
          icon="fa-angle-left"
          className='min-w-[120px] justify-center'
        />
      )}
      
      {showSkipButton && (
        <Button
          label='Skip step'
          onClick={onSkip ? onSkip : () => true}
          disabled={skipButtonDisabled}
          icon="fa-forward"
          className='min-w-[120px] justify-center'
        />
      )}
      
      <Button
        label={isLastStep ? 'Finish' : 'Next'}
        onClick={handleNext}
        icon={isProcessing ? 'fa-spin fa-gear' : 'fa-angle-right'}
        disabled={isProcessing || !canProceed}
        className={`min-w-[120px] justify-center flex-row-reverse ${isLastStep ? '!bg-green-400 !border-green-400 hover:!bg-green-500 hover:!border-green-500 !text-white' : ''}`}
      />
    </div>
  );
};

export default WizardNavigation;