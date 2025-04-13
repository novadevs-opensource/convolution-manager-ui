// src/components/characterEditor/CharacterCreatorWizard.tsx
import React, { useEffect, useState } from 'react';

// Services
import { ApiKeyService } from '../../services/apiKeyService';

// Component imports
import GenerateCharacterSection from './GenerateCharacterSection';
import CharacterDetailsSection from './CharacterDetailsSection';
import ModelProviderSelect from '../inputs/ModelProviderSelect';
import GenericTextInput from '../inputs/GenericTextInput';
import FormGroup from '../common/FormGroup';
import KnowledgeProcessingSection from './KnowledgeProcessingSection';
import ExamplesSection from './ExamplesSection';
import AdjectivesAndPeopleSection from './AdjectivesAndPeopleSection';
import CharacterResultSection from './CharacterResultSection';
import ClientConfigurationSection from './ClientConfigurationSection';

// Wizard components
import WizardSidebar from '../wizard/WizardSidebar';
import WizardHeader from '../wizard/WizardHeader';
import WizardContent from '../wizard/WizardContent';
import StepValidationStatus, { ValidationStatusItem } from '../wizard/StepValidationStatus';

// Custom hooks
import { useToasts } from '../../hooks/useToasts';
import { useGenerateCharacter } from '../../hooks/useGenerateCharacterHook';
import { useCharacterState } from '../../hooks/useCharacterState';
import { useWizardSteps } from '../../hooks/useWizardSteps';
import { useOpenRouterModels } from '../../hooks/useOpenRouterModel';

import { useWizardValidation } from '../../hooks/useWizardValidation';

// Configuration
import { WIZARD_STEPS_CONFIG } from '../../config/wizardStepConfig';
import { CharacterData } from '../../types';

// Default character settings
const defaultXSettings = {
  TWITTER_POLL_INTERVAL: 120,
  POST_INTERVAL_MIN: 90,
  POST_INTERVAL_MAX: 180,
  ACTION_INTERVAL: 5,
  MAX_ACTIONS_PROCESSING: 1,
  ACTION_TIMELINE_TYPE: 'foryou',
  POST_IMMEDIATELY: "true",
  TWITTER_TARGET_USERS: '',
};

const characterPlaceholder: CharacterData = {
  name: '',
  clients: [],
  modelProvider: 'openrouter',
  settings: { 
    secrets: {}, 
    voice: { 
      model: '' 
    },
    ...defaultXSettings,
  },
  plugins: [],
  bio: [],
  lore: [],
  knowledge: [],
  messageExamples: [],
  postExamples: [],
  topics: [],
  style: { all: [], chat: [], post: [] },
  adjectives: [],
  people: [],
};

interface CharacterCreatorWizardProps {
  userId: string;
  characterData?: CharacterData;
  selectedModel?: string;
  onDataChange?: (characterData: CharacterData, model: string) => void;
  onFinish?: () => void;
}

/**
 * Main wizard component for creating characters
 */
const CharacterCreatorWizard: React.FC<CharacterCreatorWizardProps> = ({
  characterData,
  selectedModel,
  onDataChange,
  onFinish
}) => {
  // Services and utilities
  const { addNotification } = useToasts();
  const apiKeyService = ApiKeyService.getInstance();
  
  // Custom hooks for state management
  const characterState = useCharacterState(characterData || characterPlaceholder, selectedModel || '');
  const wizardSteps = useWizardSteps(0, WIZARD_STEPS_CONFIG.length);
  const modelsState = useOpenRouterModels(apiKeyService);
  const validation = useWizardValidation(
    characterState.character, 
    characterState.selectedModelValue, 
    wizardSteps.currentStep
  );
  
  // State to track validation attempts for steps
  const [validationAttempts, setValidationAttempts] = useState<Record<number, boolean>>({});
  
  // Hook for character generation
  const {
    loading: generatingFromPrompt, 
    error: generationError, 
    character: generatedCharacter, 
    generateCharacter, 
    prompt
  } = useGenerateCharacter();

  // Initialize with models and default values
  useEffect(() => {
    if (modelsState.models.length > 0 && !characterState.selectedModelValue) {
      const defaultModelId = modelsState.getDefaultModelId();
      if (defaultModelId) {
        const updatedCharacter = modelsState.configureModelSettings(
          characterState.character, 
          defaultModelId
        );
        characterState.setFullCharacter(updatedCharacter);
        characterState.setSelectedModelValue(defaultModelId);
      }
    }
  }, [modelsState.models]);

  // Call onDataChange when character or selected model changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(
        characterState.character,
        characterState.selectedModelValue || 
        characterState.character.settings?.secrets?.LARGE_OPENROUTER_MODEL || ''
      );
    }
  }, [characterState.character, characterState.selectedModelValue, onDataChange]);

  // Set Twitter target users when people array changes
  useEffect(() => {
    characterState.syncTwitterTargetUsers();
  }, [characterState.character.people, characterState.character.clients]);

  // Handle generated character
  useEffect(() => {
    if (generatedCharacter) {
      // Preserve settings that aren't in the generated character
      const updatedCharacter = {
        ...generatedCharacter,
        modelProvider: characterState.character.modelProvider,
        settings: characterState.character.settings
      };
      
      characterState.setFullCharacter(updatedCharacter);
      
      // Auto advance to next step when generation is complete
      if (wizardSteps.currentStep === 0) {
        wizardSteps.goToNextStep();
      }
    }
    
    if (generationError) {
      console.error(generationError);
      if (generationError.message) {
        addNotification(generationError.message, 'error');
      }
    }
  }, [generatedCharacter, generationError]);

  // Set selected model
  const handleModelSelection = (modelId: string) => {
    const updatedCharacter = modelsState.configureModelSettings(
      characterState.character, 
      modelId
    );
    characterState.setFullCharacter(updatedCharacter);
    characterState.setSelectedModelValue(modelId);
  };
  
  // Check if a step is disabled - improved implementation
  const isStepDisabled = (stepIndex: number): boolean => {
    if (stepIndex === 0) return false; // First step is never disabled
    
    // If the user has never attempted to validate this step, disable it
    if (stepIndex > wizardSteps.currentStep && !validationAttempts[stepIndex]) {
      return true;
    }
    
    // Check if all previous steps are valid
    for (let i = 0; i < stepIndex; i++) {
      // Skip validation check for step 0 (generation step)
      if (i === 0 && characterState.character.name?.trim()) continue;
      
      // For steps that require validation, check if they're valid
      const stepConfig = WIZARD_STEPS_CONFIG[i];
      
      // Skip steps with skipValidation: true
      if (stepConfig.skipValidation) continue;
      
      // Get validation result for this step
      const validationResult = validation.getStepValidation(i);
      
      // If validation is not done or failed, disable this step
      if (!validation.initialValidationDone[i] || !validationResult.isValid) {
        return true;
      }
    }
    
    return false;
  };

  // Validate all previous steps when attempting to go to a new step
  const validatePreviousSteps = async (): Promise<boolean> => {
    const allValid = await validation.validateAllPreviousSteps();
    
    if (!allValid) {
      addNotification('Please complete all previous steps correctly before proceeding.', 'error');
    }
    
    return allValid;
  };

  // Handle step click in sidebar
  const handleStepClick = async (index: number) => {
    // Mark that the user attempted to validate this step
    setValidationAttempts(prev => ({
      ...prev,
      [index]: true
    }));
    
    // If trying to go forward, validate previous steps first
    if (index > wizardSteps.currentStep) {
      const allValid = await validation.validateAllPreviousSteps();
      
      if (!allValid) {
        addNotification('Please complete all previous steps correctly before proceeding.', 'error');
        return;
      }
    }
    
    // If all validations pass or going backward, allow navigation
    wizardSteps.goToStep(index);
  };
  
  // Prepare validation status for sidebar
  const prepareStepValidationStatus = () => {
    const status: Record<number, {
      isValid: boolean;
      validationItems?: ValidationStatusItem[];
      isValidationDone: boolean;
    }> = {};
    
    // Skip step 0 (generation step)
    for (let i = 1; i < WIZARD_STEPS_CONFIG.length; i++) {
      const stepConfig = WIZARD_STEPS_CONFIG[i];
      
      // Skip steps with skipValidation: true
      if (stepConfig.skipValidation) continue;
      
      // Get validation result for this step
      const validationResult = validation.getStepValidation(i);
      
      status[i] = {
        isValid: validationResult.isValid,
        validationItems: validationResult.validationItems,
        isValidationDone: validation.initialValidationDone[i] || false
      };
    }
    
    return status;
  };

  // Determine if we're currently processing something
  const isProcessing = generatingFromPrompt || validation.isValidating;
  
  // Render validation status or loading indicator
  const renderValidationStatus = () => {
    // Skip validation status for generate step (0)
    if (wizardSteps.currentStep === 0) return null;
    
    if (currentStepConfig.skipValidation) {
      return (
        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <i className="fa-solid fa-info-circle text-blue-500"></i>
            </div>
            <div>
              <h4 className="font-anek-latin font-bold text-blue-700">Optional Section</h4>
              <p className="text-sm text-blue-600">
                Adding knowledge is optional but helps your character be more informed about certain things.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // Get validation result for current step
    const validationResult = validation.getStepValidation(wizardSteps.currentStep);
    
    return (
      <StepValidationStatus 
        isValid={validationResult.isValid}
        message={validationResult.message}
        validationItems={validationResult.validationItems}
        errors={validationResult.errors}
        showDetails={true}
        isValidating={validation.isValidating}
      />
    );
  };

  // Render content for current step
  const renderStepContent = () => {
    switch (wizardSteps.currentStep) {
      case 0: // Generate Character
        return (
          <>
            <GenerateCharacterSection
              onGenerateCharacter={generateCharacter}
              forWizard={true}
              savedPrompt={prompt}
            />
            {characterState.character.name && (
              <div className="mt-4">
                {renderValidationStatus()}
              </div>
            )}
          </>
        );

      case 1: // Basic Information
        return (
          <>
            <div className="flex flex-col">
              <FormGroup className='flex md:grid md:grid-cols-2 w-full flex flex-col !mb-0'>
                <GenericTextInput
                  plain={true} 
                  label='Character Name'
                  name='character-name'
                  placeholder="Enter the character's full name (e.g., John Smith, Lady Catherine)"
                  onChange={(e) => characterState.handleInputChange('name', e.target.value)}
                  value={characterState.character.name}
                  required={true}
                />
                <div className='w-full flex flex-col'>
                  <ModelProviderSelect
                    label='Large Language Model'
                    selected={characterState.character.settings?.secrets?.OPENROUTER_MODEL || characterState.selectedModelValue || ''}
                    onChange={handleModelSelection}
                    models={modelsState.models}
                  />
                  {characterState.selectedModelValue?.includes(':free') && (
                    <small className='-mt-2 flex flex-row gap-2 items-center bg-yellow-100 rounded-md p-2'>
                      <i className='fa fa-warning rounded-full border-2 p-1 text-white bg-yellow-500 border-red-300'></i>
                      <span className='text-yellow-600 font-anek-latin'><b>Free</b> models are <b>limited</b> to 20 requests per minute and 200 requests per day. <b>Use them just for testing purposes.</b></span>
                    </small>
                  )}
                </div>
              </FormGroup>
              <FormGroup>
                <ClientConfigurationSection
                  character={characterState.character}
                  handleInputChange={characterState.handleInputChange}
                  forWizard={true}
                />
              </FormGroup>
            </div>
            {renderValidationStatus()}
          </>
        );

      case 2: // Character Details
        return (
          <>
            <CharacterDetailsSection
              character={characterState.character}
              handleInputChange={characterState.handleInputChange}
              forWizard={true}
            />
            {renderValidationStatus()}
          </>
        );

      case 3: // Knowledge
        return (
          <>
            <KnowledgeProcessingSection
              knowledge={characterState.character.knowledge}
              onKnowledgeChange={characterState.updateKnowledge}
              forWizard={true}
            />
            {renderValidationStatus()}
          </>
        );

      case 4: // Examples
        return (
          <>
            <ExamplesSection
              messageExamples={characterState.character.messageExamples}
              postExamples={characterState.character.postExamples}
              characterName={characterState.character.name}
              onMessageExamplesChange={characterState.updateMessageExamples}
              onPostExamplesChange={characterState.updatePostExamples}
              forWizard={true}
            />
            {renderValidationStatus()}
          </>
        );

      case 5: // Attributes & People
        return (
          <>
            <AdjectivesAndPeopleSection
              adjectives={characterState.character.adjectives}
              people={characterState.character.people}
              onAdjectivesChange={characterState.updateAdjectives}
              onPeopleChange={characterState.updatePeople}
              forWizard={true}
            />
            {renderValidationStatus()}
          </>
        );

      case 6: // Review
        return (
          <>
            <CharacterResultSection character={characterState.character} forWizard={true}/>
            <div className="mt-4">
              {renderValidationStatus()}
            </div>
          </>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  // Get current step configuration
  const currentStepConfig = WIZARD_STEPS_CONFIG[wizardSteps.currentStep];
  const canProceed = validation.canProceedToNextStep();

  // Handle next step with validation
  const handleNextStep = async () => {
    if (wizardSteps.isLastStep) {
      // If this is the last step, call finalize handler
      if (onFinish) {
        onFinish();
      }
      return;
    }
    
    // Mark that we attempted to validate the next step
    const nextStep = wizardSteps.currentStep + 1;
    setValidationAttempts(prev => ({
      ...prev,
      [nextStep]: true
    }));
    
    // Validate all previous steps before proceeding
    const allValid = await validation.validateAllPreviousSteps();
    if (!allValid) {
      addNotification('Please complete all previous steps correctly before proceeding.', 'error');
      return;
    }
    
    // If all validations pass, go to next step
    wizardSteps.goToNextStep();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 rounded-xl">
      {/* Sidebar Navigation */}
      <WizardSidebar
        steps={WIZARD_STEPS_CONFIG}
        currentStep={wizardSteps.currentStep}
        onStepClick={handleStepClick}
        isStepDisabled={isStepDisabled}
        stepValidationStatus={prepareStepValidationStatus()}
      />

      {/* Main Content Area using WizardContent */}
      <WizardContent
        currentStep={wizardSteps.currentStep}
        totalSteps={WIZARD_STEPS_CONFIG.length}
        onNext={handleNextStep}
        onPrevious={wizardSteps.goToPreviousStep}
        onSkip={wizardSteps.goToNextStep}
        canProceed={canProceed}
        isProcessing={isProcessing}
        showSkipButton={currentStepConfig.canSkip}
        skipButtonDisabled={!apiKeyService.getApiKey()}
        onValidatePrevious={validatePreviousSteps}
      >
        {/* Header */}
        <WizardHeader
          title={currentStepConfig.title}
          subtitle={currentStepConfig.subtitle}
          currentStep={wizardSteps.currentStep}
          totalSteps={WIZARD_STEPS_CONFIG.length}
          onNext={handleNextStep}
          onPrevious={wizardSteps.goToPreviousStep}
          onSkip={wizardSteps.goToNextStep}
          canProceed={canProceed}
          isProcessing={isProcessing}
          showSkipButton={currentStepConfig.canSkip}
          skipButtonDisabled={!apiKeyService.getApiKey()}
          onValidatePrevious={validatePreviousSteps}
        />
        
        {/* Step Content */}
        <div className="my-8 p-8 rounded-lg bg-white border border-yellow-200 transition duration-150 ease-in-out">
          {renderStepContent()}
        </div>
      </WizardContent>
    </div>
  );
};

export default CharacterCreatorWizard;