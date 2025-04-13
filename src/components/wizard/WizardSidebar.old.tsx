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
 * Component for rendering the wizard sidebar with step navigation
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
      return 'bg-white text-black';
    }
    
    // Future steps
    return 'bg-gray-700 text-gray-400';
  };

  return (
    <div className="lg:w-1/4 w-full rounded-lg">
      <nav className="space-y-1">
        {steps.map((step, index) => {
          const isDisabled = isStepDisabled(index);
          
          return (
            <button
              key={step.id}
              onClick={() => onStepClick(index)}
              disabled={isDisabled}
              className={`flex items-center w-full p-6 text-left rounded-md transition-colors ${
                currentStep === index
                  ? 'bg-yellow-500 text-black'
                  : isDisabled
                  ? 'text-gray-800 bg-gray-200 cursor-not-allowed'
                  : 'text-yellow-500 bg-black hover:bg-yellow-500 hover:text-black'
              }`}
            >
              <div className="flex-shrink-0 mr-3">
                <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
                  getStepStatusClass(index)
                }`}>
                  {getStepStatusIcon(index)}
                </div>
              </div>
              <div className="truncate">
                <div className="font-medium font-anek-latin">{step.title}</div>
                {step.subtitle && (
                  <div className="text-xs opacity-75 font-afacad">{step.subtitle}</div>
                )}
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  );
};

export default WizardSidebar;