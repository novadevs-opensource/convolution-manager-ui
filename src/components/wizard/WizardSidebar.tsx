// src/components/wizard/WizardSidebar.tsx
import React from 'react';
import { WizardStepConfig } from '../../config/wizardStepConfig';
import { ValidationStatusItem } from './StepValidationStatus';

interface WizardSidebarProps {
  steps: WizardStepConfig[];
  currentStep: number;
  onStepClick: (index: number) => void;
  isStepDisabled: (index: number) => boolean;
  stepValidationStatus?: Record<number, {
    isValid: boolean;
    validationItems?: ValidationStatusItem[];
    isValidationDone: boolean;
  }>;
}

/**
 * Component for rendering the wizard sidebar with a timeline navigation
 */
const WizardSidebar: React.FC<WizardSidebarProps> = ({
  steps,
  currentStep,
  onStepClick,
  isStepDisabled,
  stepValidationStatus = {}
}) => {
  // Function to get status icon for a step
  const getStepStatusIcon = (index: number) => {
    // Steps before current
    if (index < currentStep) {
      // Step validation status is available and step is not skippable
      if (stepValidationStatus[index] && !steps[index].skipValidation) {
        if (stepValidationStatus[index].isValidationDone && stepValidationStatus[index].isValid) {
          return <i className="fa-solid fa-check text-xs"></i>;
        } else {
          return <i className="fa-solid fa-exclamation text-xs"></i>;
        }
      }
      // Default for completed steps or skippable steps
      return <i className="fa-solid fa-check text-xs"></i>;
    }
    
    // Current or future steps just show the step number
    return <span className="text-xs">{index + 1}</span>;
  };
  
  // Function to get status class for a step
  const getStepStatusClass = (index: number) => {
    // Steps before current
    if (index < currentStep) {
      // Step validation status is available
      if (stepValidationStatus[index] && !steps[index].skipValidation) {
        if (stepValidationStatus[index].isValidationDone && stepValidationStatus[index].isValid) {
          return 'bg-green-500 text-white';
        } else {
          return 'bg-yellow-500 text-white';
        }
      }
      // Default for completed steps
      return 'bg-green-500 text-white';
    }
    
    // Current step
    if (index === currentStep) {
      return 'bg-yellow-500 text-black';
    }
    
    // Future steps
    return 'bg-gray-700 text-white';
  };

  // Function to get line color between steps
  const getLineColor = (index: number) => {
    if (index < currentStep) {
      // Completed steps get green line
      if (stepValidationStatus[index] && !steps[index].skipValidation) {
        if (stepValidationStatus[index].isValidationDone && !stepValidationStatus[index].isValid) {
          return 'bg-yellow-500'; // Warning state
        }
      }
      return 'bg-green-500';
    }
    
    // Current and future steps
    return 'bg-gray-500';
  };

  // Function to get text color for step based on its state
  const getTextColorClass = (index: number) => {
    const isDisabled = isStepDisabled(index);
    
    if (currentStep === index) {
      return 'text-black font-bold';
    } else if (isDisabled) {
      return 'text-gray-400';
    } else if (index < currentStep) {
      // Completed
      return 'text-green-500';
    } else {
      // Future steps
      return 'text-gray-300';
    }
  };

  return (
    <div className="lg:w-1/4 w-full rounded-lg p-4 mt-5">
      <div className="relative">
        {steps.map((step, index) => {
          const isDisabled = isStepDisabled(index);
          const isLastStep = index === steps.length - 1;
          
          return (
            <div key={step.id} className="relative">
              <div className="flex items-start mb-6">
                {/* Dot/status indicator */}
                <div className="flex-shrink-0 relative z-10 border-t-4 border-b-4 rounded-full border-yellow-50">
                  <button
                    onClick={() => !isDisabled && onStepClick(index)}
                    disabled={isDisabled}
                    className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300 ${
                      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-yellow-300'
                    } ${getStepStatusClass(index)}`}
                  >
                    {getStepStatusIcon(index)}
                  </button>
                </div>
                
                {/* Step content */}
                <div className={`ml-4 ${isDisabled ? 'opacity-70' : ''}`}>
                  <button
                    onClick={() => !isDisabled && onStepClick(index)}
                    disabled={isDisabled}
                    className={`text-left w-full ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`font-medium font-anek-latin transition-colors ${getTextColorClass(index)}`}>
                      {step.title}
                    </div>
                    {step.subtitle && (
                      <div className={`text-sm font-afacad  ${isDisabled ? 'opacity-75 text-gray-400' : 'text-black'}`}>
                        {step.subtitle}
                      </div>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Vertical line connecting to next step */}
              {!isLastStep && (
                <div 
                  className={`absolute left-4 top-8 w-0.5 h-full ml-0 -translate-x-1/2 ${getLineColor(index)}`}
                >
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardSidebar;