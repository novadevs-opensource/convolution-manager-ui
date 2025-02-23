// src/components/characterEditor/GenerateCharacterSection.tsx
import React, { useState, useEffect } from 'react';
import { ApiKeyService } from '../../services/apiKeyService';

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
    <section className="section" id="generate-character-section">
      <div className="section-header">
        <span>Generate Character</span>
        <button
          className="icon-button help-button"
          title="Generate a new character using AI by providing a description"
        >
          <i className="fa-solid fa-wand-sparkles"></i>
        </button>
      </div>
      <div className="section-content">
        {/* Selección de modelo */}
        <div className="form-group">
          <label htmlFor="model-select">AI Model</label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="">Select a model</option>
            <optgroup label="OpenAI Models">
              <option value="openai/gpt-4-0125-preview">GPT-4 Turbo Preview (0125)</option>
              <option value="openai/gpt-4-1106-preview">GPT-4 Turbo Preview (1106)</option>
              <option value="openai/gpt-4-vision-preview">GPT-4 Vision</option>
              <option value="openai/gpt-4">GPT-4</option>
              <option value="openai/gpt-3.5-turbo-0125">GPT-3.5 Turbo (0125)</option>
              <option value="openai/gpt-3.5-turbo-1106">GPT-3.5 Turbo (1106)</option>
              <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo [FREE]</option>
            </optgroup>
            <optgroup label="Anthropic Models">
              <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
              <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="anthropic/claude-2.1">Claude 2.1</option>
              <option value="anthropic/claude-2">Claude 2</option>
              <option value="anthropic/claude-instant-1.2">Claude Instant 1.2</option>
            </optgroup>
            <optgroup label="Google Models">
              <option value="google/gemini-pro">Gemini Pro [FREE]</option>
              <option value="google/gemini-pro-vision">Gemini Pro Vision</option>
              <option value="google/palm-2">PaLM 2 [FREE]</option>
              <option value="google/palm-2-vision">PaLM 2 Vision</option>
            </optgroup>
            <optgroup label="Meta Models">
              <option value="meta-llama/llama-3.2-3b-instruct">Llama 3.2 3B Instruc [FREE]</option>
              <option value="meta/llama-2-70b-chat">Llama 2 70B Chat [FREE]</option>
              <option value="meta/llama-2-13b-chat">Llama 2 13B Chat [FREE]</option>
              <option value="meta/llama-2-7b-chat">Llama 2 7B Chat [FREE]</option>
            </optgroup>
            <optgroup label="Mistral Models">
              <option value="mistral/mistral-large">Mistral Large</option>
              <option value="mistral/mistral-medium">Mistral Medium</option>
              <option value="mistral/mistral-small">Mistral Small [FREE]</option>
              <option value="mistral/mixtral-8x7b">Mixtral 8x7B [FREE]</option>
            </optgroup>
            <optgroup label="Other Models">
              <option value="perplexity/pplx-70b-online">PPLX 70B Online</option>
              <option value="perplexity/pplx-7b-online">PPLX 7B Online [FREE]</option>
              <option value="perplexity/pplx-70b-chat">PPLX 70B Chat</option>
              <option value="perplexity/pplx-7b-chat">PPLX 7B Chat [FREE]</option>
              <option value="cohere/command">Cohere Command</option>
              <option value="cohere/command-light">Cohere Command Light [FREE]</option>
              <option value="cohere/command-nightly">Cohere Command Nightly</option>
              <option value="cohere/command-light-nightly">Cohere Command Light Nightly [FREE]</option>
            </optgroup>
          </select>
        </div>

        {/* Gestión de la API Key */}
        <div className="form-group">
          <label htmlFor="api-key">OpenRouter API Key</label>
          {savedApiKey ? (
            <div id="api-key-status" className="api-key-status" style={{ display: 'flex' }}>
              <span className="status-text">API key is set</span>
              <button
                id="remove-key"
                className="action-button delete-button"
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
        </div>

        {/* Descripción (prompt) y botones de generación/refinamiento */}
        <div className="form-group">
          <label htmlFor="character-prompt">Character Description</label>
          <div className="input-group">
            <textarea
              id="character-prompt"
              placeholder="Describe your character in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>
          <div className="button-group">
            <button
              id="generate-from-prompt"
              className="action-button generate-button"
              title="Generate from Prompt"
              onClick={handleGenerate}
            >
              <i className="fa-solid fa-bolt"></i>
            </button>
            <button
              id="refine-character"
              className="action-button generate-button"
              title="Refine existing character"
              onClick={handleRefine}
            >
              <i className="fa-solid fa-wand-sparkles"></i>
            </button>
          </div>
          <div id="prompt-status" className="error">
            {status}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenerateCharacterSection;
