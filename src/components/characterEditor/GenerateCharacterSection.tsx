// src/components/characterEditor/GenerateCharacterSection.tsx
import React, { useState, useEffect } from 'react';
import { ApiKeyService } from '../../services/apiKeyService';
import CharacterEditorSection from './CharacterEditorSection';
import FormGroup from '../common/FormGroup';
import ModelProviderSelect from '../inputs/ModelProviderSelect';
import { OpenRouterModel } from '../../types';
import Button from '../common/Button';
import GenericTextInput from '../inputs/GenericTextInput';
import GenericTextArea from '../inputs/GenericTextArea';

interface GenerateCharacterSectionProps {
  onGenerateCharacter: (prompt: string, model: string, apiKey: string) => Promise<void>;
  onRefineCharacter: (prompt: string, model: string, apiKey: string) => Promise<void>;
}

const GenerateCharacterSection: React.FC<GenerateCharacterSectionProps> = ({
  onGenerateCharacter,
  onRefineCharacter,
}) => {
  const [model, setModel] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // Instancia del servicio
  const apiKeyService = ApiKeyService.getInstance();

  const [openRouterAvailableModels, setOpenRouterAvailableModels] = useState<OpenRouterModel[]>([]);
    useEffect(() => {
      handleGetAvailableModels();
    }, [])

    const handleGetAvailableModels = async() => {
      try {
        const rawResponse = await fetch('https://openrouter.ai/api/v1/models', {
          method: 'GET',
        })
        if (!rawResponse.ok) {
          throw new Error(`HTTP error! status: ${rawResponse.status}`);
        }
        const jsonData = await rawResponse.json();
        const text2textModels = jsonData.data.filter((model: OpenRouterModel) => model.architecture.modality === 'text->text');
        setOpenRouterAvailableModels(text2textModels);
      } catch (error: any) {
        console.error('Load error:', error);
        alert(`Error retrieving available models: ${error.message}`);
      }
    }

  // Al montar, comprobamos si hay API key guardada
  useEffect(() => {
    const storedKey = apiKeyService.getApiKey();
    if (storedKey) {
      setSavedApiKey(storedKey);
      setApiKey(storedKey); // opcional, para prellenar el input
    }
  }, [apiKeyService]);

  const handleSaveApiKey = () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setStatus('Please enter a valid API key');
      return;
    }
    apiKeyService.saveApiKey(trimmedKey);
    setSavedApiKey(trimmedKey);
    setStatus('API key saved successfully');
  };

  const handleRemoveApiKey = () => {
    apiKeyService.removeApiKey();
    setSavedApiKey(null);
    setApiKey('');
    setStatus('API key removed');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setStatus('Please enter a prompt');
      return;
    }
    if (!model) {
      setStatus('Please select a model');
      return;
    }
    if (!savedApiKey && !apiKey) {
      setStatus('Please set your OpenRouter API key');
      return;
    }
    const keyToUse = savedApiKey || apiKey;
    setStatus('Generating character...');
    try {
      await onGenerateCharacter(prompt, model, keyToUse);
      setStatus('Character generated successfully');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleRefine = async () => {
    if (!prompt.trim()) {
      setStatus('Please enter refinement instructions');
      return;
    }
    if (!model) {
      setStatus('Please select a model');
      return;
    }
    if (!savedApiKey && !apiKey) {
      setStatus('Please set your OpenRouter API key');
      return;
    }
    const keyToUse = savedApiKey || apiKey;
    setStatus('Refining character...');
    try {
      await onRefineCharacter(prompt, model, keyToUse);
      setStatus('Character refined successfully');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <CharacterEditorSection
      title={'Generate Character'}
      headerIcon={
        <button
          className="icon-button help-button"
          title="Generate a new character using AI by providing a description"
        >
          <i className="fa-solid fa-wand-sparkles"></i>
        </button>
      }
    >
      {/* Selección de modelo */}
      <FormGroup>
        <ModelProviderSelect
          label='LLM Model'
          selected={model || ''}
          onChange={(val) => setModel(val)}
          models={openRouterAvailableModels}
        />
      </FormGroup>

      {/* Gestión de la API Key */}
      <FormGroup>
        {savedApiKey ? (
          <div className='flex flex-row gap-2 items-end'>
            <GenericTextInput
              plain={true}
              label='OpenRouter API Key'
              value={apiKey?.substring(0,20)+'...'}
              disabled={true}
            />
            <button
                id="remove-key"
                className="border-2 border-black bg-black hover:bg-white text-white hover:text-black rounded-md h-fit py-3 px-4 mb-4"
                title="Remove API Key"
                onClick={handleRemoveApiKey}
              >
                <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        ) : (
          <div id="api-key-input" className="input-group" style={{ display: 'flex' }}>
            <input
              type="text"
              id="api-key"
              placeholder="Enter your OpenRouter API key starting with 'sk-' from openrouter.ai"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              id="save-key"
              className="action-button save-button"
              title="Save API Key"
              onClick={handleSaveApiKey}
            >
              <i className="fa-solid fa-floppy-disk"></i>
            </button>
          </div>
        )}
      </FormGroup>

      {/* Descripción (prompt) y botones de generación/refinamiento */}
      <FormGroup>
        <GenericTextArea
          label='Seed prompt'
          name='character-prompt'
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your character in detail..."
          value={prompt}
        />
        <div className="flex flex-row gap-2">
          <Button className='w-[120px]' onClick={handleGenerate} label={'Generate'} icon='fa-bolt'/>
          <Button className='w-[120px]' onClick={handleRefine} label={'Refine'} icon='fa-wand-sparkles'/>
        </div>
        <div id="prompt-status" className="error">
          {status}
        </div>
      </FormGroup>
    </CharacterEditorSection>
  )
};

export default GenerateCharacterSection;
