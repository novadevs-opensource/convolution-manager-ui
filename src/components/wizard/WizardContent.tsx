import React, { ReactNode } from 'react';
import WizardNavigation from './WizardNavigation';

interface WizardContentProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  canProceed: boolean;
  isProcessing: boolean;
  showSkipButton?: boolean;
  skipButtonDisabled?: boolean;
}

/**
 * Component for rendering the wizard content area
 */
const WizardContent: React.FC<WizardContentProps> = ({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  canProceed,
  isProcessing,
  showSkipButton = false,
  skipButtonDisabled = false
}) => {
  return (
    <div className="lg:w-3/4 w-full">
      <div className="sm:p-6 p-0 rounded-lg">
        {/* Content area */}
        {children}

        {/* Mobile navigation (visible on small screens) */}
        <div className="sm:hidden flex-row gap-2 items-end justify-end flex-grow flex">
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={onNext}
            onPrevious={onPrevious}
            onSkip={onSkip}
            canProceed={canProceed}
            isProcessing={isProcessing}
            showSkipButton={showSkipButton}
            skipButtonDisabled={skipButtonDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default WizardContent;