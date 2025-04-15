// src/components/characterEditor/GenerateCharacterSection.tsx
import React, { useState, useEffect } from 'react';
import { ApiKeyService } from '../../services/apiKeyService';
import CharacterEditorSection from './CharacterEditorSection';
import FormGroup from '../common/FormGroup';
import Button from '../common/Button';
import GenericTextArea from '../inputs/GenericTextArea';
import { useToasts } from '../../hooks/useToasts';

interface GenerateCharacterSectionProps {
  onGenerateCharacter: (prompt: string, model: string, apiKey: string) => Promise<void>;
  forWizard?: boolean;
  savedPrompt?: string;
}

const GenerateCharacterSection: React.FC<GenerateCharacterSectionProps> = ({
  onGenerateCharacter,
  forWizard = false,
  savedPrompt,
}) => {
  const { addNotification } = useToasts();
  const [model] = useState<string>('meta-llama/llama-3.3-70b-instruct:free');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(savedPrompt ?? '');
  const [status, setStatus] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  //TODO: Add interfaces for error and success, do backend request to persist the generation prompt.

  // Instancia del servicio
  const apiKeyService = ApiKeyService.getInstance();

  useEffect(() => {
    const storedKey = apiKeyService.getApiKey();
    if (storedKey) {
      setSavedApiKey(storedKey);
    } else {
      setStatus('Please set your OpenRouter API key in your "Profile" settings first');
    }
  }, [apiKeyService]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setStatus('Please enter a valid prompt');
      return;
    }
    
    if (!savedApiKey) {
      setStatus('Please set your OpenRouter API key');
      return;
    }
    setIsGenerating(true);
    setStatus('');

    try {
      await onGenerateCharacter(prompt, model, savedApiKey);
      addNotification('Settings generated successfully', 'success');
    } catch (err: any) {
      addNotification('Error generating settings', 'error');
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return forWizard ? (
    <div>
        <FormGroup>
          <GenericTextArea
            label={forWizard ? 'Describe your character' : 'Seed prompt'}
            name='character-prompt-box'
            onChange={(e) => {
              setPrompt(e.target.value)
              setStatus('');
            }}
            placeholder="Write a detailed prompt describing your AI personality - include their name, background, personality traits, interests, communication style, and any other relevant information..."
            value={prompt}
            showCharCount={true}
            maxLength={650}
            plain={true}
            errorMessages={[status]}
            disabled={isGenerating}
          />
          
          <div className="">
            <div className='flex flex-row gap-4'>
              <Button 
                onClick={handleGenerate} 
                label={isGenerating ? 'Generating...' : 'Generate'} 
                icon={isGenerating ? 'fa-spin fa-gear' : 'fa-bolt'}
                disabled={isGenerating || !savedApiKey}
              />
            </div>
            
            {!savedApiKey && (
              <p className="text-amber-500 mt-2 text-sm">
                <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                Please set your OpenRouter API key in your "Profile" settings first
              </p>
            )}
          </div>
        </FormGroup>
        
        <div className="mt-6 p-4 bg-beige-200 rounded-lg text-black">
          <h4 className="font-semibold mb-2 font-afacad">Prompt Tips:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm font-anek-latin">
            <li>Include a specific name for your character</li>
            <li>Describe their personality traits, background, and interests</li>
            <li>Mention their communication style and tone</li>
            <li>Add details about their knowledge areas or expertise</li>
          </ul>
        </div>
    </div>
  ): (
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
        <FormGroup>
          <GenericTextArea
            label={forWizard ? 'Describe your character' : 'Seed prompt'}
            name='character-prompt-box'
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write a detailed prompt describing your AI personality - include their name, background, personality traits, interests, communication style, and any other relevant information..."
            value={prompt}
            showCharCount={true}
            maxLength={650}
            className={forWizard 
              ? 'h-[250px] rounded-none placeholder-gray-400' 
              : ''
            }
            plain={true}
            errorMessages={[status]}
            disabled={isGenerating}
          />
          
          <div className="mt-4">
            <Button 
              onClick={handleGenerate} 
              label={isGenerating ? 'Generating...' : 'Generate'} 
              icon={isGenerating ? 'fa-spin fa-gear' : 'fa-bolt'}
              disabled={isGenerating || !prompt.trim() || !savedApiKey}
            />
            
            {!savedApiKey && (
              <p className="text-amber-500 mt-2 text-sm">
                <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                Please set your OpenRouter API key in your "Profile" settings first
              </p>
            )}
          </div>
        </FormGroup>
      </CharacterEditorSection>
  )
};

export default GenerateCharacterSection;
