import React from 'react';
import { WizardStepConfig } from '../../config/wizardStepConfig';

interface WizardSidebarProps {
  steps: WizardStepConfig[];
  currentStep: number;
  onStepClick: (index: number) => void;
  isStepDisabled: (index: number) => boolean;
}

/**
 * Component for rendering the wizard sidebar with step navigation
 */
const WizardSidebar: React.FC<WizardSidebarProps> = ({
  steps,
  currentStep,
  onStepClick,
  isStepDisabled
}) => {
  return (
    <div className="lg:w-1/4 w-full rounded-lg">
      <nav className="space-y-1">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepClick(index)}
            disabled={isStepDisabled(index)}
            className={`flex items-center w-full p-6 text-left rounded-md transition-colors ${
              currentStep === index
                ? 'bg-gradient-primary text-white'
                : isStepDisabled(index)
                ? 'text-gray-800 bg-gray-200 cursor-not-allowed'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : currentStep === index
                  ? 'bg-white text-black'
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {index < currentStep ? (
                  <i className="fa-solid fa-check text-xs"></i>
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
            </div>
            <div className="truncate">
              <div className="font-medium font-anek-latin">{step.title}</div>
              {step.subtitle && (
                <div className="text-xs opacity-75 font-afacad">{step.subtitle}</div>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default WizardSidebar;