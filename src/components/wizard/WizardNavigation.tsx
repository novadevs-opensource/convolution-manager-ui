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
  className = ''
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

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
        onClick={onNext}
        icon={isProcessing ? 'fa-spin fa-gear' : 'fa-angle-right'}
        disabled={isProcessing || !canProceed}
        className={`min-w-[120px] justify-center flex-row-reverse ${isLastStep ? 'bg-gradient-secondary !hover:bg-white !text-black' : ''}`}
      />
    </div>
  );
};

export default WizardNavigation;