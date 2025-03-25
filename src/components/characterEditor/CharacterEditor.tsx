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
import GenericTextInput from '../inputs/GenericTextInput';
import FormGroup from '../common/FormGroup';
import CharacterEditorSection from './CharacterEditorSection';
import GenericNumberInput from '../inputs/GenericNumberInput';
import GenericSelectInput from '../inputs/GenericSelectInput';
import GenericCheckboxInput from '../inputs/GenericCheckboxInput';
import Accordion from '../common/Accordion';

const defaultXSettings = {
  TWITTER_POLL_INTERVAL: 120,
  POST_INTERVAL_MIN: 90,
  POST_INTERVAL_MAX: 180,
  ACTION_INTERVAL: 5,
  MAX_ACTIONS_PROCESSING: 1,
  ACTION_TIMELINE_TYPE: 'foryou',
  POST_IMMEDIATELY: true,
  TWITTER_TARGET_USERS: '',
}

const initialCharacter: CharacterData = {
  name: '',
  clients: [],
  modelProvider: '',
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

interface CharacterEditorProps {
  userId: string;
  characterData?: CharacterData;
  selectedModel?: string;
  onDataChange?: (characterData: CharacterData, model: string) => void;
}

const CharacterEditor: React.FC<CharacterEditorProps> = ({ 
  characterData, 
  selectedModel,
  onDataChange 
}) => {
  const apiKeyService = ApiKeyService.getInstance();
  const [character, setCharacter] = useState<CharacterData>(characterData || initialCharacter);
  const [selectedModelValue, setSelectedModelValue] = useState<string>(selectedModel || '');
  
  const [backups, setBackups] = useState<BackupListItem[]>([]);
  const [openRouterAvailableModels, setOpenRouterAvailableModels] = useState<OpenRouterModel[]>([]);

  const [, setRefinementPrompt] = useState<string>();
  const [, setGenerationPrompt] = useState<string>();

  const [showTelegramConfigForm, setShowTelegramConfigForm] = useState<boolean>(false);
  const [showTwitterConfigForm, setShowTwitterConfigForm] = useState<boolean>(false);

  const accordionItems = [
    {
      title: "Telegram",
      content: showTelegramConfigForm && (
              <FormGroup>
                <GenericTextInput
                  plain={true} 
                  label='Telegram bot token'
                  name='telegram-bot-token'
                  placeholder="Your Telegram's bot ID"
                  onChange={(e) => handleInputChange('settings.secrets.TELEGRAM_BOT_TOKEN', e.target.value)}
                  value={character.settings?.secrets?.TELEGRAM_BOT_TOKEN}
                  required={true}
                />
              </FormGroup>)
    },
    {
      title: "X",
      content: showTwitterConfigForm && (
                <>
                  {/* credentials */}
                  <FormGroup className='flex md:flex-row flex-col'>
                    <GenericTextInput
                      plain={true} 
                      label='X account handler (without @)'
                      name='x_handler'
                      placeholder="Your X handler here"
                      onChange={(e) => handleInputChange('settings.secrets.TWITTER_USERNAME', e.target.value)}
                      value={character.settings?.secrets?.TWITTER_USERNAME}
                      required={true}
                    />
                    <GenericTextInput
                      plain={true} 
                      label='X account password'
                      name='x_password'
                      type="password"
                      onChange={(e) => handleInputChange('settings.secrets.TWITTER_PASSWORD', e.target.value)}
                      value={character.settings?.secrets?.TWITTER_PASSWORD}
                      required={true}
                    />
                    <GenericTextInput
                      plain={true} 
                      label='X account email'
                      name='x_email'
                      placeholder="Your X mail here"
                      onChange={(e) => handleInputChange('settings.secrets.TWITTER_EMAIL', e.target.value)}
                      value={character.settings?.secrets?.TWITTER_EMAIL}
                      required={true}
                    />
                  </FormGroup>
                  {/* cookies */}
                  <FormGroup className='flex md:flex-row flex-col'>
                    <GenericTextInput
                      plain={true} 
                      label='X account cookie auth_token'
                      name='x_auth_token'
                      placeholder="auth_token"
                      onChange={(e) => handleInputChange('settings.secrets.TWITTER_COOKIES_AUTH_TOKEN', e.target.value)}
                      value={character.settings?.secrets?.TWITTER_COOKIES_AUTH_TOKEN}
                    />
                    <GenericTextInput
                      plain={true} 
                      label='X account cookie ct0'
                      name='x_ct0'
                      placeholder='ct0'
                      onChange={(e) => handleInputChange('settings.secrets.TWITTER_COOKIES_CT0', e.target.value)}
                      value={character.settings?.secrets?.TWITTER_COOKIES_CT0}
                    />
                    <GenericTextInput
                      plain={true} 
                      label='X account cookie guest_id'
                      name='x_guest_id'
                      placeholder="guest_id"
                      onChange={(e) => handleInputChange('settings.secrets.TWITTER_COOKIES_GUEST_ID', e.target.value)}
                      value={character.settings?.secrets?.TWITTER_COOKIES_GUEST_ID}
                    />
                  </FormGroup>
                  {/* post immediately */}
                  <FormGroup className='flex md:flex-row flex-col'>
                    <GenericCheckboxInput
                      label='Generate a new post immediately the agent is started or every time is updated while is running'
                      checked={character.settings?.POST_IMMEDIATELY}
                      onChange={(e) => handleInputChange('settings.POST_IMMEDIATELY', e.target.checked)}
                    />
                  </FormGroup>
                  {/* post interval and timeline settings */}
                  <FormGroup className='flex md:flex-row flex-col sm:w-8/12 w-full'>
                    <GenericNumberInput
                      plain={true}
                      label='Post min Interval Settings (in minutes)'
                      name=''
                      placeholder="90"
                      onChange={(e) => handleInputChange('settings.POST_INTERVAL_MIN', Number(e.target.value))}
                      value={character.settings?.POST_INTERVAL_MIN ?? 90}
                    />
                    <GenericNumberInput
                      plain={true}
                      label='Post max Interval Settings (in minutes)'
                      name=''
                      placeholder="180"
                      onChange={(e) => handleInputChange('settings.POST_INTERVAL_MAX', Number(e.target.value))}
                      value={character.settings?.POST_INTERVAL_MAX ?? 180}
                    />
                  </FormGroup>
                  <FormGroup className='flex md:flex-row flex-col w-8/12 items-end'>
                    <GenericNumberInput
                      plain={true}
                      label='How often (in seconds) the bot should check for interactions (mentions and replies)'
                      name=''
                      placeholder="120"
                      onChange={(e) => handleInputChange('settings.TWITTER_POLL_INTERVAL', Number(e.target.value))}
                      value={character.settings?.TWITTER_POLL_INTERVAL ?? 120}
                    />
                    <GenericSelectInput 
                      selected={character.settings?.ACTION_TIMELINE_TYPE ?? 'foryou'} 
                      onChange={(val) => handleInputChange('settings.ACTION_TIMELINE_TYPE', val)} 
                      values={[
                        {label:'Following', value: 'following'},
                        {label:'For you', value: 'foryou'},
                      ]}
                      label='Type of timeline to interact with.'
                    />
                  </FormGroup>
                  <FormGroup className='flex md:flex-row flex-col sm:w-8/12 w-full'>
                    <GenericNumberInput
                      plain={true} 
                      label='Interval in minutes between timeline processing runs evaluating if some of the timeline posts need to be retweeted quoted or replied'
                      name=''
                      placeholder="5"
                      onChange={(e) => handleInputChange('settings.ACTION_INTERVAL', Number(e.target.value))}
                      value={character.settings?.ACTION_INTERVAL ?? 5}
                    />
                    <GenericNumberInput
                      plain={true} 
                      label='Maximum number of actions (e.g., retweets, likes) to process in a single cycle. Helps prevent excessive or uncontrolled actions.'
                      name=''
                      placeholder="1"
                      onChange={(e) => handleInputChange('settings.MAX_ACTIONS_PROCESSING', Number(e.target.value))}
                      value={character.settings?.MAX_ACTIONS_PROCESSING ?? 1}
                    />
                  </FormGroup>
                </>)
    }
  ];

  useEffect(() => {
    if (openRouterAvailableModels.length > 0 && !selectedModelValue) {
      let defaultFreeModel = openRouterAvailableModels.find((model: OpenRouterModel) => model.id === 'meta-llama/llama-3.3-70b-instruct:free'); // TODO: Add to env var
      console.log(defaultFreeModel);
      if (defaultFreeModel) {
        setSelectedModelValue(defaultFreeModel.id);
      }
    }
  }, [openRouterAvailableModels])

  // Call onDataChange when character or selected model changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(character, selectedModelValue || character.settings?.secrets?.LARGE_OPENROUTER_MODEL || '');
    }
  }, [character, selectedModelValue, onDataChange]);

  useEffect(() => {
    handleGetAvailableModels();
  }, []);

  useEffect(() => {
    character.clients.includes('telegram') ? setShowTelegramConfigForm(true) : setShowTelegramConfigForm(false);
    character.clients.includes('twitter') ? setShowTwitterConfigForm(true) : setShowTwitterConfigForm(false);
  }, [character.clients]);

  useEffect(() => {
    if (character.clients.includes('twitter')) {
      // Comma separated list of Twitter user names to force interact with
      character.settings.TWITTER_TARGET_USERS = character.people.length > 0 ? character.people.join(',') : ''; 
    }
  }, [character.people])

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
      
      const response = await fetch(`${process.env.HOST}:${process.env.PORT}/api/generate-character`, {
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
    <div className="sm:grid sm:grid-cols-4 flex flex-col gap-4">
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
      <div className="col-span-3">
        {/* Basic Information */}
        <CharacterEditorSection
          title={'Basic Information'}
          headerIcon={
            <button className="h-[24px] w-[24px] border border-gray-200 bg-white rounded-full" title="Set the character's name, model provider, and voice settings">
              <i className="fa-solid fa-id-card"></i>
            </button>
          }
        >
          <FormGroup className='flex md:flex-row flex-col'>
            <GenericTextInput
                plain={true} 
              label='Character Name'
                name='character-name'
                placeholder="Enter the character's full name (e.g., John Smith, Lady Catherine)"
                onChange={(e) => handleInputChange('name', e.target.value)}
              value={character.name}
            />
            <ModelProviderSelect
              label='Large Language Model'
              selected={character.settings?.secrets?.OPENROUTER_MODEL || selectedModelValue || ''}
              onChange={(value) => {
                handleInputChange('settings.secrets.OPENROUTER_MODEL', value);
                handleInputChange('settings.secrets.SMALL_OPENROUTER_MODEL', value);
                handleInputChange('settings.secrets.MEDIUM_OPENROUTER_MODEL', value);
                handleInputChange('settings.secrets.LARGE_OPENROUTER_MODEL', value);
                handleInputChange('settings.secrets.OPENROUTER_API_KEY', apiKeyService.getApiKey());
                handleInputChange('modelProvider', 'openrouter');
                setSelectedModelValue(value);
              }}
              models={openRouterAvailableModels}
            />
          </FormGroup>

          <FormGroup>
            <ClientToggles
              availableClients={['twitter', 'telegram'] as Client[]}
              selectedClients={character.clients}
              onChange={(value: Client[]) =>
                setCharacter(prev => ({ ...prev, clients: value }))
              }
              label='Available clients'
            />
            <Accordion items={accordionItems} />
          </FormGroup>

        {/* TODO: Enable when X spaces are ready
          <FormGroup className='flex md:flex-row flex-col'>
            <GenericTextInput
              plain={true} 
              label='Voice Model'
              name='voice-model'
              placeholder="Voice synthesis model identifier for text-to-speech"
              onChange={(e) => handleInputChange('settings.voice.model', e.target.value)}
              value={character.settings?.voice?.model}
            />
          </FormGroup>
        */}
        </CharacterEditorSection>

        {/* bio and communication style */}
        <CharacterDetailsSection
          character={character}
          handleInputChange={handleInputChange}
        />
        {/* RAG */}
        <KnowledgeProcessingSection
          knowledge={character.knowledge}
          onKnowledgeChange={updateKnowledge}
        />
        {/* communication examples */}
        <ExamplesSection
          messageExamples={character.messageExamples}
          postExamples={character.postExamples}
          characterName={character.name}
          onMessageExamplesChange={updateMessageExamples}
          onPostExamplesChange={updatePostExamples}
        />
        {/* adjetives and people */}
        <AdjectivesAndPeopleSection
          adjectives={character.adjectives}
          people={character.people}
          onAdjectivesChange={updateAdjectives}
          onPeopleChange={updatePeople}
        />
        {/* results */}
        <CharacterResultSection character={character} />
      </div>
    </div>
  );
};

export default CharacterEditor;