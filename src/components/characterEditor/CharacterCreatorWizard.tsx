import React, { useState, useEffect } from 'react';
import { CharacterData, MessageExample, OpenRouterModel } from '../../types';
import { ApiKeyService } from '../../services/apiKeyService';
import { useToasts } from '../../hooks/useToasts';
import Button from '../common/Button';

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
import { useGenerateCharacter } from '../../hooks/useGenerateCharacterHook';
import ClientConfigurationSection from './ClientConfigurationSection';

// Default settings
const defaultXSettings = {
  TWITTER_POLL_INTERVAL: 120,
  POST_INTERVAL_MIN: 90,
  POST_INTERVAL_MAX: 180,
  ACTION_INTERVAL: 5,
  MAX_ACTIONS_PROCESSING: 1,
  ACTION_TIMELINE_TYPE: 'foryou',
  POST_IMMEDIATELY: true,
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

const CharacterCreatorWizard: React.FC<CharacterCreatorWizardProps> = ({
  characterData,
  selectedModel,
  onDataChange,
  onFinish
}) => {
  const { addNotification } = useToasts();
  const apiKeyService = ApiKeyService.getInstance();
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [character, setCharacter] = useState<CharacterData>(characterData || characterPlaceholder);
  const [selectedModelValue, setSelectedModelValue] = useState<string>(selectedModel || '');
  const [openRouterAvailableModels, setOpenRouterAvailableModels] = useState<OpenRouterModel[]>([]);

  // Initialize with models
  useEffect(() => {
    handleGetAvailableModels();
  }, []);

  // Set default model when options load
  useEffect(() => {
    if (openRouterAvailableModels.length > 0 && !selectedModelValue) {
      setSelectedModelValues('meta-llama/llama-3.3-70b-instruct:free');
    }
  }, [openRouterAvailableModels]);
  // Set model related stuff
  const setSelectedModelValues = (modelId: string) => {
    let model = openRouterAvailableModels.find(
      (model: OpenRouterModel) => model.id === modelId
    );
    if (model) {
      setSelectedModelValue(model.id);
      handleInputChange('settings.secrets.OPENROUTER_MODEL', model.id);
      handleInputChange('settings.secrets.SMALL_OPENROUTER_MODEL', model.id);
      handleInputChange('settings.secrets.MEDIUM_OPENROUTER_MODEL', model.id);
      handleInputChange('settings.secrets.LARGE_OPENROUTER_MODEL', model.id);
      handleInputChange('settings.secrets.OPENROUTER_API_KEY', apiKeyService.getApiKey());
      handleInputChange('modelProvider', 'openrouter');
      setSelectedModelValue(model.id);
    }
  }

  // Call onDataChange when character or selected model changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(character, selectedModelValue || character.settings?.secrets?.LARGE_OPENROUTER_MODEL || '');
    }
  }, [character, selectedModelValue, onDataChange]);

  // Set Twitter target users when people array changes
  useEffect(() => {
    if (character.clients.includes('twitter')) {
      // Comma separated list of Twitter user names to force interact with
      const newSettings = {...character.settings};
      newSettings.TWITTER_TARGET_USERS = character.people.length > 0 ? character.people.join(',') : '';
      setCharacter(prev => ({ ...prev, settings: newSettings }));
    }
  }, [character.people, character.clients]);

  // Handler for updating nested fields
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setCharacter(prev => {
        const newChar = { ...prev } as any;
        let pointer = newChar;
        for (let i = 0; i < keys.length - 1; i++) {
          pointer[keys[i]] = { ...pointer[keys[i]] };
          pointer = pointer[keys[i]];
        }
        pointer[keys[keys.length - 1]] = value;
        return newChar;
      });
    } else {
      setCharacter(prev => ({ ...prev, [field]: value }));
    }
  };

  // Hook for generating a character
  const {loading: generatingFromPromt, error: generationError, character: generatedCharacter, generateCharacter, prompt} = useGenerateCharacter();
  // Handler for generating a character
  useEffect(() => {
    if (generatedCharacter) {
      generatedCharacter.modelProvider = character.modelProvider // Autogenerated settings doesn't preserve the default modelProvider
      generatedCharacter.settings = character.settings // Autogenerated settings doesn't preserve the default settings and settings.secrets
      setCharacter(generatedCharacter);
      // Auto advance to next step when generation is complete
      if (currentStep === 0) {
        setCurrentStep(1);
      }
    }
    if (generationError) {
      console.log(generationError);
    }
  }, [generatedCharacter, generationError])

  // Fetch available models from OpenRouter
  const handleGetAvailableModels = async() => {
    try {
      const rawResponse = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
      });
      
      if (!rawResponse.ok) {
        throw new Error(`HTTP error! status: ${rawResponse.status}`);
      }
      
      const jsonData = await rawResponse.json();
      const text2textModels = jsonData.data.filter(
        (model: OpenRouterModel) => model.architecture.modality === 'text->text'
      );
      
      setOpenRouterAvailableModels(text2textModels);
    } catch (error: any) {
      console.error('Load error:', error);
      addNotification(`Error retrieving available models: ${error.message}`, 'error');
    }
  };

  // Array handlers
  const updateKnowledge = (newKnowledge: string[]) => {
    setCharacter(prev => ({ ...prev, knowledge: newKnowledge }));
  };

  const updateMessageExamples = (newExamples: MessageExample[][]) => {
    setCharacter(prev => ({ ...prev, messageExamples: newExamples }));
  };

  const updatePostExamples = (newPosts: string[]) => {
    setCharacter(prev => ({ ...prev, postExamples: newPosts }));
  };

  const updateAdjectives = (newAdjectives: string[]) => {
    setCharacter(prev => ({ ...prev, adjectives: newAdjectives }));
  };

  const updatePeople = (newPeople: string[]) => {
    setCharacter(prev => ({ ...prev, people: newPeople }));
  };

  // Wizard navigation
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onFinish) {
        onFinish();
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  // Check if character has a name (required to proceed)
  const characterHasName = character.name && character.name.trim().length > 0;
  
  // Define wizard steps
  const steps = [
    {
      id: 'step-generate',
      title: 'Autogenerate your ICON',
      subtitle: 'Create your ICON personality with a seed prompt',
      content: (
        <GenerateCharacterSection
          onGenerateCharacter={generateCharacter}
          forWizard={true}
          savedPrompt={prompt}
        />
      ),
      isDisabled: () => false,
      canProceed: () => character.name && character.name.length > 0
    },
    {
      id: 'step-basics',
      title: 'Basic Information',
      subtitle: 'Set name, model and clients',
      content: (
        <div className="flex flex-col gap-6 grow-[10]">
          <FormGroup className='flex md:flex-row flex-col'>
            <GenericTextInput
              plain={true} 
              label='Character Name'
              name='character-name'
              placeholder="Enter the character's full name (e.g., John Smith, Lady Catherine)"
              onChange={(e) => handleInputChange('name', e.target.value)}
              value={character.name}
              required={true}
            />
            <ModelProviderSelect
              label='Model Provider'
              selected={character.settings?.secrets?.OPENROUTER_MODEL || selectedModelValue || ''}
              onChange={(value) => setSelectedModelValues(value)}
              models={openRouterAvailableModels}
            />
          </FormGroup>
          <FormGroup>
          <ClientConfigurationSection
            character={character}
            handleInputChange={handleInputChange}
            forWizard={true}
          />
          </FormGroup>
        </div>
      ),
      isDisabled: () => !characterHasName, // TODO: Add validation
      canProceed: () => character.clients.length > 0 && character.name.length > 0 && selectedModelValue.length > 0 // TODO: Add validation
    },
    {
      id: 'step-details',
      title: 'Character Details',
      subtitle: 'Define personality and style',
      content: (
        <CharacterDetailsSection
          character={character}
          handleInputChange={handleInputChange}
          forWizard={true}
        />
      ),
      isDisabled: () => character.clients.length < 1 || !character.name || !selectedModelValue, // TODO: Add validation
      canProceed: () => character.clients.length > 0 && character.name.length > 0 && selectedModelValue.length > 0 // TODO: Add validation
    },
    {
      id: 'step-knowledge',
      title: 'Knowledge',
      subtitle: 'Add knowledge for your character',
      content: (
        <KnowledgeProcessingSection
          knowledge={character.knowledge}
          onKnowledgeChange={updateKnowledge}
          forWizard={true}
        />
      ),
      isDisabled: () => character.clients.length < 1 || !character.name || !selectedModelValue, // TODO: Add validation
      canProceed: () => character.clients.length > 0 && character.name.length > 0 && selectedModelValue.length > 0 // TODO: Add validation
    },
    {
      id: 'step-examples',
      title: 'Examples',
      subtitle: 'Add message and post examples',
      content: (
        <ExamplesSection
          messageExamples={character.messageExamples}
          postExamples={character.postExamples}
          characterName={character.name}
          onMessageExamplesChange={updateMessageExamples}
          onPostExamplesChange={updatePostExamples}
          forWizard={true}
        />
      ),
      isDisabled: () => character.clients.length < 1 || !character.name || !selectedModelValue, // TODO: Add validation
      canProceed: () => character.clients.length > 0 && character.name.length > 0 && selectedModelValue.length > 0 // TODO: Add validation
    },
    {
      id: 'step-attributes',
      title: 'Attributes & People',
      subtitle: 'Define adjectives and people related to your character',
      content: (
        <AdjectivesAndPeopleSection
          adjectives={character.adjectives}
          people={character.people}
          onAdjectivesChange={updateAdjectives}
          onPeopleChange={updatePeople}
          forWizard={true}
        />
      ),
      isDisabled: () => character.clients.length < 1 || !character.name || !selectedModelValue, // TODO: Add validation
      canProceed: () => character.clients.length > 0 && character.name.length > 0 && selectedModelValue.length > 0 // TODO: Add validation
    },
    {
      id: 'step-review',
      title: 'Review',
      subtitle: 'Review your character settings',
      content: (
        <CharacterResultSection character={character} forWizard={true}/>
      ),
      isDisabled: () => character.clients.length < 1 || !character.name || !selectedModelValue, // TODO: Add validation
      canProceed: () => character.clients.length > 0 && character.name.length > 0 && selectedModelValue.length > 0 // TODO: Add validation
    }
  ];

  const currentStepData = steps[currentStep];
  const canProceedToNextStep = currentStepData?.canProceed();

  return (
    <div className="flex flex-col lg:flex-row gap-6 rounded-xl">
      {/* Sidebar Navigation */}
      <div className="lg:w-1/4 w-full rounded-lg">
        <nav className="space-y-1">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              disabled={step.isDisabled()}
              className={`flex items-center w-full p-6 text-left rounded-md transition-colors ${
                currentStep === index
                  ? 'bg-gradient-primary text-white'
                  : step.isDisabled()
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

      {/* Main Content Area */}
      <div className="lg:w-3/4 w-full">
        <div className="sm:p-6 p-0 rounded-lg">
          <div className="mb-6">
            <div className='sm:grid sm:grid-cols-2 flex flex-col'>
              <div className='flex flex-col'>
                <h2 className="text-3xl font-bold font-anek-latin">{currentStepData.title}</h2>
                {currentStepData.subtitle && (
                  <h3 className="text-lg font-afacad">{currentStepData.subtitle}</h3>
                )}
              </div>
              <div className="sm:flex flex-row gap-2 items-end justify-end flex-grow hidden">
                {currentStep > 0 &&
                  <Button
                    label='Previous'
                    onClick={goToPreviousStep}
                    disabled={generatingFromPromt || currentStep === 0}
                    icon="fa-angle-left"
                    className='min-w-[120px] justify-center'
                  />
                }
                <Button
                  label={currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  onClick={goToNextStep}
                  icon={generatingFromPromt ? 'fa-spin fa-gear' : 'fa-angle-right'}
                  disabled={generatingFromPromt || !canProceedToNextStep}
                  className='min-w-[120px] justify-center flex-row-reverse'
                />
              </div>
            </div>
          </div>

          <div className="my-8 p-8 rounded-lg bg-black-ultra border border-gray-200 shadow-lg transition duration-150 ease-in-out">
            {currentStepData.content}
          </div>

          <div className="sm:hidden flex-row gap-2 items-end justify-end flex-grow flex">
            {currentStep > 0 &&
              <Button
                label='Previous'
                onClick={goToPreviousStep}
                disabled={generatingFromPromt || currentStep === 0}
                icon="fa-angle-left"
                className='min-w-[120px] justify-center'
              />
            }
            <Button
              label={currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              onClick={goToNextStep}
              icon={generatingFromPromt ? 'fa-spin fa-gear' : 'fa-angle-right'}
              disabled={generatingFromPromt || !canProceedToNextStep}
              className='min-w-[120px] justify-center flex-row-reverse'
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CharacterCreatorWizard;