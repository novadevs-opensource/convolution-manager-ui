// src/components/characterEditor/CharacterEditor.tsx
import React, { useEffect, useState } from 'react';

import Sidebar from './Sidebar';
import CharacterDetailsSection from './CharacterDetailsSection';
import KnowledgeProcessingSection from './KnowledgeProcessingSection';
import ExamplesSection from './ExamplesSection';
import AdjectivesAndPeopleSection from './AdjectivesAndPeopleSection';
import CharacterResultSection from './CharacterResultSection';
import { CharacterData, MessageExample, BackupListItem, OpenRouterModel, Client } from '../../types';
import ClientToggles from './ClientToggles';
import ModelProviderSelect from '../inputs/ModelProviderSelect';
import { ApiKeyService } from '../../services/apiKeyService';


const initialCharacter: CharacterData = {
  name: '',
  clients: [],
  modelProvider: '',
  settings: { 
    secrets: {}, 
    voice: { 
      model: '' } 
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

interface CharacterEditorProps {
  userId: string,
  characterData?: CharacterData,
  agentId?: string,
  selectedModel?: string,
}

const CharacterEditor: React.FC<CharacterEditorProps> = ({ characterData }) => {
  const apiKeyService = ApiKeyService.getInstance();

  const [character, setCharacter] = useState<CharacterData>(characterData || initialCharacter);
  const [backups, setBackups] = useState<BackupListItem[]>([]);
  const [openRouterAvailableModels, setOpenRouterAvailableModels] = useState<OpenRouterModel[]>([]);

  const [, setRefinementPrompt] = useState<string>();
  const [, setGenerationPrompt] = useState<string>();

  const [showTelegramConfigForm, setShowTelegramConfigForm] = useState<boolean>(false);
  const [showTwitterConfigForm, setShowTwitterConfigForm] = useState<boolean>(false);

  useEffect(() => {
    handleGetAvailableModels();
    handleInputChange('settings.secrets.OPENROUTER_API_KEY', apiKeyService.getApiKey());
  }, [])

  useEffect(() => {
      character.clients.includes('telegram') ? setShowTelegramConfigForm(true) : setShowTelegramConfigForm(false);
      character.clients.includes('twitter') ? setShowTwitterConfigForm(true) : setShowTwitterConfigForm(false);
  }, [character.clients]);

  // Handler para actualizar campos simples o anidados
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

  const updateNestedField = (path: string, value: any) => {
    const keys = path.split('.');
    setCharacter(prev => {
      const newState = { ...prev } as any;
      let pointer = newState;
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          pointer[key] = value;
        } else {
          pointer[key] = { ...pointer[key] };
          pointer = pointer[key];
        }
      });
      return newState;
    });
  };

  // Handlers para el Sidebar, backups, generación y refinamiento (se mantienen igual)
  const handleLoadCharacter = (characterData: CharacterData) => {
    const loadedCharacter: CharacterData = {
      ...initialCharacter,
      ...characterData,
      clients: Array.isArray(characterData.clients) ? characterData.clients : [],
      adjectives: Array.isArray(characterData.adjectives) ? characterData.adjectives : [],
      people: Array.isArray(characterData.people) ? characterData.people : [],
    };
    setCharacter(loadedCharacter);
  };

  // Handlers de backups (simplificados)
  const handleSaveBackup = (name: string) => {
    const newBackup: BackupListItem = {
      name,
      timestamp: new Date().toLocaleString(),
      key: name.toLowerCase().replace(/\s+/g, '_'),
    };
    setBackups(prev => [...prev, newBackup]);
  };

  const handleLoadBackup = (name: string) => {
    alert(`Load backup: ${name}`);
  };

  const handleRenameBackup = (oldName: string, newName: string) => {
    setBackups(prev =>
      prev.map(b =>
        b.name === oldName
          ? { ...b, name: newName, key: newName.toLowerCase().replace(/\s+/g, '_') }
          : b
      )
    );
  };

  const handleDeleteBackup = (name: string) => {
    setBackups(prev => prev.filter(b => b.name !== name));
  };

  // Handlers para llamadas a la API
  const handleGenerateCharacter = async (prompt: string, model: string, apiKey: string) => {
    try {
      const response = await fetch('http://0.0.0.0:4001/api/generate-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ prompt, model }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      data.character.people = [];
      setCharacter(data.character);
      setGenerationPrompt(prompt);
    } catch (error: any) {
      console.error('Generation error:', error);
      alert(`Error generating character: ${error.message}`);
    }
  };

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

  const handleRefineCharacter = async (prompt: string, model: string, apiKey: string) => {
    try {
      const response = await fetch('/api/refine-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ prompt, model, currentCharacter: character }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRefinementPrompt(prompt);
      setCharacter(data.character);
    } catch (error: any) {
      console.error('Refinement error:', error);
      alert(`Error refining character: ${error.message}`);
    }
  };

  // Handlers para actualizar arrays (knowledge, messageExamples, postExamples, adjectives, people)
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

  return (
    <div className="flex flex-row gap-4">
      <Sidebar
        onLoadCharacter={handleLoadCharacter}
        backups={backups}
        onSaveBackup={handleSaveBackup}
        onLoadBackup={handleLoadBackup}
        onRenameBackup={handleRenameBackup}
        onDeleteBackup={handleDeleteBackup}
        onGenerateCharacter={handleGenerateCharacter}
        onRefineCharacter={handleRefineCharacter}
      />
      <div className="flex-grow">
        {/* Basic Information */}
        <section className="section">
          <div className="section-header">
            <span>Basic Information</span>
            <button className="icon-button help-button" title="Set the character's name, model provider, and voice settings">
              <i className="fa-solid fa-id-card"></i>
            </button>
          </div>
          <div className="section-content">
            <div className="form-group">
              <label htmlFor="character-name">Character Name</label>
              <input
                type="text"
                id="character-name"
                placeholder="Enter the character's full name (e.g., John Smith, Lady Catherine)"
                onChange={(e) => handleInputChange('name', e.target.value)}
                value={character.name}
              />
            </div>

            <ClientToggles
              availableClients={['discord', 'direct', 'twitter', 'telegram', 'farcaster'] as Client[]}
              selectedClients={character.clients}
              onChange={(value: Client[]) =>
                setCharacter(prev => ({ ...prev, clients: value }))
              }
            />

            {showTelegramConfigForm && (
              <div className="form-group">
                <label htmlFor="character-name">Telegram bot token</label>
                <input
                  type="text"
                  placeholder="Your Telegram's bot ID"
                  onChange={(e) => handleInputChange('settings.secrets.TELEGRAM_BOT_TOKEN', e.target.value)}
                  value={character.settings?.secrets?.TELEGRAM_BOT_TOKEN}
                />
                <small>required</small>
              </div>
            )}

            {showTwitterConfigForm && (
              <>
              <div className="form-group">
                <label htmlFor="character-name">X account handler (without @)</label>
                <input
                  type="text"
                  placeholder="Your X handler here"
                  onChange={(e) => handleInputChange('settings.secrets.TWITTER_USERNAME', e.target.value)}
                  value={character.settings?.secrets?.TWITTER_USERNAME}
                />
                <small>required</small>
              </div>

              <div className="form-group">
                <label htmlFor="character-name">X account password</label>
                <input
                  type="password"
                  onChange={(e) => handleInputChange('settings.secrets.TWITTER_PASSWORD', e.target.value)}
                  value={character.settings?.secrets?.TWITTER_PASSWORD}
                />
                <small>required</small>
              </div>

              <div className="form-group">
                <label htmlFor="character-name">X (formerly Twitter) email</label>
                <input
                  type="text"
                  placeholder="Your X mail here"
                  onChange={(e) => handleInputChange('settings.secrets.TWITTER_EMAIL', e.target.value)}
                  value={character.settings?.secrets?.TWITTER_EMAIL}
                />
                <small>required</small>
              </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="model-provider">Model Provider</label>
              <ModelProviderSelect
                selected={character.settings?.secrets?.OPENROUTER_MODEL || ''}
                onChange={(value) => {
                  handleInputChange('settings.secrets.OPENROUTER_MODEL', value)
                  handleInputChange('settings.secrets.SMALL_OPENROUTER_MODEL', value)
                  handleInputChange('settings.secrets.MEDIUM_OPENROUTER_MODEL', value)
                  handleInputChange('settings.secrets.LARGE_OPENROUTER_MODEL', value)
                  handleInputChange('modelProvider', 'openrouter')
                }}
                models={openRouterAvailableModels}
              />
            </div>

            <div className="form-group">
              <label htmlFor="voice-model">Voice Model</label>
              <input
                type="text"
                id="voice-model"
                placeholder="Voice synthesis model identifier for text-to-speech"
                onChange={(e) => updateNestedField('settings.voice.model', e.target.value)}
                value={character.settings?.voice?.model}
              />
            </div>
          </div>
        </section>

        <CharacterDetailsSection
          character={character}
          handleInputChange={handleInputChange}
        />
        <KnowledgeProcessingSection
          knowledge={character.knowledge}
          onKnowledgeChange={updateKnowledge}
        />
        <ExamplesSection
          messageExamples={character.messageExamples}
          postExamples={character.postExamples}
          characterName={character.name}
          onMessageExamplesChange={updateMessageExamples}
          onPostExamplesChange={updatePostExamples}
        />
        <AdjectivesAndPeopleSection
          adjectives={character.adjectives}
          people={character.people}
          onAdjectivesChange={updateAdjectives}
          onPeopleChange={updatePeople}
        />
        <CharacterResultSection character={character} />
      </div>
    </div>
  );
};

export default CharacterEditor;
