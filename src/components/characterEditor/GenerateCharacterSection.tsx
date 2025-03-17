// src/components/characterEditor/GenerateCharacterSection.tsx
import React, { useState, useEffect } from 'react';
import { ApiKeyService } from '../../services/apiKeyService';
import CharacterEditorSection from './CharacterEditorSection';
import FormGroup from '../common/FormGroup';
import ModelProviderSelect from '../inputs/ModelProviderSelect';
import { OpenRouterModel } from '../../types';
import Button from '../common/Button';
import GenericTextArea from '../inputs/GenericTextArea';
import { useToasts } from '../../hooks/useToasts';

interface GenerateCharacterSectionProps {
  onGenerateCharacter: (prompt: string, model: string, apiKey: string) => Promise<void>;
  onRefineCharacter: (prompt: string, model: string, apiKey: string) => Promise<void>;
}

const GenerateCharacterSection: React.FC<GenerateCharacterSectionProps> = ({
  onGenerateCharacter,
}) => {
  const { addNotification } = useToasts();
  const [model, setModel] = useState<string>('meta-llama/llama-3.3-70b-instruct:free');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  //TODO: Add interfaces for error and success, do backend request to persist the generation prompt.

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

  useEffect(() => {
    const storedKey = apiKeyService.getApiKey();
    if (storedKey) {
      setSavedApiKey(storedKey);
    }
  }, [apiKeyService]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setStatus('Please enter a prompt');
      return;
    }
    if (!model) {
      setStatus('Please select a model');
      return;
    }
    if (!savedApiKey) {
      setStatus('Please set your OpenRouter API key');
      return;
    }
    setIsGenerating(true);

    try {
      await onGenerateCharacter(prompt, model, savedApiKey);
      setStatus('');
      setIsGenerating(false);
      addNotification('Settings generated successfully', 'success');
    } catch (err: any) {
      addNotification('Settings generation error', 'error');
      setStatus(`Error: ${err.message}`);
      setIsGenerating(false);
    }
  };

  return (
    <CharacterEditorSection
      title={'Autogenerate settings with AI'}
      headerIcon={
        <button
          className="icon-button help-button"
          title="Generate a new agent using AI by providing a description"
        >
          <i className="fa-solid fa-wand-sparkles"></i>
        </button>
      }
    >
      {/* Selección de modelo */}
      <FormGroup>
        <ModelProviderSelect
          label='LLM generation handler'
          selected={model || ''}
          onChange={(val) => setModel(val)}
          models={openRouterAvailableModels}
        />
      </FormGroup>

      {/* Descripción (prompt) y botones de generación/refinamiento */}
      <FormGroup>
        <GenericTextArea
          label='Seed prompt'
          name='character-prompt-box'
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your character in detail..."
          value={prompt}
          showCharCount={true}
          maxLength={650}
          className='h-[250px]'
          plain={true}
          errorMessages={[status]}
          disabled={isGenerating}
        />
        <div className="flex flex-row gap-2 sm:justify-start justify-end">
          <Button 
            onClick={handleGenerate} 
            label={isGenerating ? 'Generating...' : 'Generate'} 
            icon={isGenerating ? 'fa-spin fa-gear' : 'fa-bolt'}
            disabled={isGenerating}
          />
          {/*
          <Button onClick={handleRefine} label={'Refine'} icon='fa-wand-sparkles'/>
          */}
        </div>
      </FormGroup>
    </CharacterEditorSection>
  )
};

export default GenerateCharacterSection;
