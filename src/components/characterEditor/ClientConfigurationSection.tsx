// src/components/characterEditor/ClientConfigurationSection.tsx
import React, { useState, useEffect } from 'react';
import { CharacterData, Client } from '../../types';
import FormGroup from '../common/FormGroup';
import ClientToggles from './ClientToggles';
import Accordion, { AccordionItem } from '../common/Accordion';
import GenericTextInput from '../inputs/GenericTextInput';
import GenericNumberInput from '../inputs/GenericNumberInput';
import GenericSelectInput from '../inputs/GenericSelectInput';
import GenericCheckboxInput from '../inputs/GenericCheckboxInput';
import Separator from '../common/Separator';
import { useCharacterValidation } from '../../hooks/useCharacterValidation';

interface ClientConfigurationSectionProps {
  character: CharacterData;
  handleInputChange: (field: string, value: any) => void;
  forWizard?: boolean;
}

const ClientConfigurationSection: React.FC<ClientConfigurationSectionProps> = ({
  character,
  handleInputChange,
  forWizard = false
}) => {
  // Client visibility state
  const [showTelegramConfigForm, setShowTelegramConfigForm] = useState<boolean>(false);
  const [showTwitterConfigForm, setShowTwitterConfigForm] = useState<boolean>(false);
  
  // Field validation state
  const [telegramTokenError, setTelegramTokenError] = useState<string | null>(null);
  const [twitterUsernameError, setTwitterUsernameError] = useState<string | null>(null);
  const [twitterPasswordError, setTwitterPasswordError] = useState<string | null>(null);
  const [twitterEmailError, setTwitterEmailError] = useState<string | null>(null);
  
  // Use validation hook
  const { validateClientCredentials, validating } = useCharacterValidation();
  
  // State to track which field is currently validating
  const [field, setField] = useState<string | null>(null);
  
  // Local state for form inputs
  const [formState, setFormState] = useState({
    // Telegram settings
    telegramToken: '',
    
    // Twitter credentials
    twitterUsername: '',
    twitterPassword: '',
    twitterEmail: '',
    twitterAuthToken: '',
    twitterCt0: '',
    twitterGuestId: '',
    
    // Twitter settings
    postImmediately: true,
    postIntervalMin: 90,
    postIntervalMax: 180,
    pollInterval: 120,
    actionTimelineType: 'foryou',
    actionInterval: 5,
    maxActions: 1
  });

  // Initialize accordion items
  const [accordionItems, setAccordionItems] = useState<AccordionItem[]>([]);

  // Update visibility based on selected clients
  useEffect(() => {
    setShowTelegramConfigForm(character.clients.includes('telegram'));
    setShowTwitterConfigForm(character.clients.includes('twitter'));
  }, [character.clients]);

  // Update local state from character props
  useEffect(() => {
    setFormState({
      telegramToken: character.settings?.secrets?.TELEGRAM_BOT_TOKEN || '',
      twitterUsername: character.settings?.secrets?.TWITTER_USERNAME || '',
      twitterPassword: character.settings?.secrets?.TWITTER_PASSWORD || '',
      twitterEmail: character.settings?.secrets?.TWITTER_EMAIL || '',
      twitterAuthToken: character.settings?.secrets?.TWITTER_COOKIES_AUTH_TOKEN || '',
      twitterCt0: character.settings?.secrets?.TWITTER_COOKIES_CT0 || '',
      twitterGuestId: character.settings?.secrets?.TWITTER_COOKIES_GUEST_ID || '',
      postImmediately: character.settings?.POST_IMMEDIATELY || true,
      postIntervalMin: character.settings?.POST_INTERVAL_MIN || 90,
      postIntervalMax: character.settings?.POST_INTERVAL_MAX || 180,
      pollInterval: character.settings?.TWITTER_POLL_INTERVAL || 120,
      actionTimelineType: character.settings?.ACTION_TIMELINE_TYPE || 'foryou',
      actionInterval: character.settings?.ACTION_INTERVAL || 5,
      maxActions: character.settings?.MAX_ACTIONS_PROCESSING || 1
    });
  }, [character]);

  // Validate Telegram Token
  const validateTelegramToken = async () => {
    if (!formState.telegramToken) {
      setTelegramTokenError('Bot token is required');
      return false;
    }
    
    // Basic format validation
    if (!/^\d+:[A-Za-z0-9_-]{35,}$/.test(formState.telegramToken)) {
      setTelegramTokenError('Invalid token format');
      return false;
    }
    
    try {
      // Call the backend validation
      const result = await validateClientCredentials('telegram', {
        token: formState.telegramToken
      });
      
      setTelegramTokenError(null);
      return result.isValid;
    } catch (error: any) {
      setTelegramTokenError(error.response?.data?.message || 'Validation failed');
      return false;
    }
  };
  
  // Validate Twitter credentials
  const validateTwitterCredentials = async () => {
    let hasErrors = false;
    
    // Basic validation
    if (!formState.twitterUsername) {
      setTwitterUsernameError('Username is required');
      hasErrors = true;
    } else if (!/^[A-Za-z0-9_]{1,15}$/.test(formState.twitterUsername)) {
      setTwitterUsernameError('Invalid username format');
      hasErrors = true;
    } else {
      setTwitterUsernameError(null);
    }
    
    if (!formState.twitterPassword) {
      setTwitterPasswordError('Password is required');
      hasErrors = true;
    } else if (formState.twitterPassword.length < 8) {
      setTwitterPasswordError('Password must be at least 8 characters');
      hasErrors = true;
    } else {
      setTwitterPasswordError(null);
    }
    
    if (!formState.twitterEmail) {
      setTwitterEmailError('Email is required');
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.twitterEmail)) {
      setTwitterEmailError('Invalid email format');
      hasErrors = true;
    } else {
      setTwitterEmailError(null);
    }
    
    if (hasErrors) {
      return false;
    }
    
    try {
      // Call the backend validation
      const result = await validateClientCredentials('twitter', {
        username: formState.twitterUsername,
        password: formState.twitterPassword,
        email: formState.twitterEmail
      });
      
      return result.isValid;
    } catch (error: any) {
      // Extract specific field errors if available
      const errors = error.response?.data?.errors || {};
      
      if (errors.username) setTwitterUsernameError(errors.username[0]);
      if (errors.password) setTwitterPasswordError(errors.password[0]);
      if (errors.email) setTwitterEmailError(errors.email[0]);
      
      return false;
    }
  };

  // Handle field blur events for validation
  const handleFieldBlur = async (fieldName: string) => {
    setField(fieldName);
    
    if (fieldName === 'telegramToken') {
      await validateTelegramToken();
    } else if (['twitterUsername', 'twitterPassword', 'twitterEmail'].includes(fieldName)) {
      await validateTwitterCredentials();
    }
    
    setField(null);
  };

  // Handle input changes
  const handleFormChange = (field: string, value: any) => {
    // Update local state first for immediate feedback
    setFormState(prev => ({ ...prev, [field]: value }));
    
    // Clear error state when field is edited
    if (field === 'telegramToken') setTelegramTokenError(null);
    if (field === 'twitterUsername') setTwitterUsernameError(null);
    if (field === 'twitterPassword') setTwitterPasswordError(null);
    if (field === 'twitterEmail') setTwitterEmailError(null);
    
    // Map local state field to character fields
    const fieldMap: Record<string, string> = {
      'telegramToken': 'settings.secrets.TELEGRAM_BOT_TOKEN',
      'twitterUsername': 'settings.secrets.TWITTER_USERNAME',
      'twitterPassword': 'settings.secrets.TWITTER_PASSWORD',
      'twitterEmail': 'settings.secrets.TWITTER_EMAIL',
      'twitterAuthToken': 'settings.secrets.TWITTER_COOKIES_AUTH_TOKEN',
      'twitterCt0': 'settings.secrets.TWITTER_COOKIES_CT0',
      'twitterGuestId': 'settings.secrets.TWITTER_COOKIES_GUEST_ID',
      'postImmediately': 'settings.POST_IMMEDIATELY',
      'postIntervalMin': 'settings.POST_INTERVAL_MIN',
      'postIntervalMax': 'settings.POST_INTERVAL_MAX',
      'pollInterval': 'settings.TWITTER_POLL_INTERVAL',
      'actionTimelineType': 'settings.ACTION_TIMELINE_TYPE',
      'actionInterval': 'settings.ACTION_INTERVAL',
      'maxActions': 'settings.MAX_ACTIONS_PROCESSING'
    };
    
    // Update parent component state
    if (fieldMap[field]) {
      handleInputChange(fieldMap[field], value);
    }
  };

  // Update accordion items when needed
  useEffect(() => {
    const items: AccordionItem[] = [];
    
    // Add Telegram configuration if needed
    if (showTelegramConfigForm) {
      items.push({
        title: "Telegram",
        content: (
          <div>
            <div className='mb-4 py-2'>
              <h3 className='font-anek-latin text-2xl text-gray-500 font-semibold'>Settings</h3>
              <p className='text-gray-500'>Be sure to copy/paste the right token</p>
            </div>
            <FormGroup>
              <GenericTextInput
                plain={true} 
                label='Telegram bot token'
                name='telegram-bot-token'
                placeholder="Your Telegram's bot ID"
                onChange={(e) => handleFormChange('telegramToken', e.target.value)}
                onBlur={() => handleFieldBlur('telegramToken')}
                value={formState.telegramToken}
                required={true}
                hasError={!!telegramTokenError}
                errorMessages={telegramTokenError ? [telegramTokenError] : []}
              />
              {validating && field === 'telegramToken' && (
                <div className="text-gray-500 flex items-center mt-1">
                  <i className="fa-solid fa-sync fa-spin mr-2"></i>
                  <span>Validating token...</span>
                </div>
              )}
            </FormGroup>
          </div>
        )
      });
    }
    
    // Add Twitter/X configuration if needed
    if (showTwitterConfigForm) {
      items.push({
        title: "X",
        content: (
          <div>
            {/* Twitter credentials */}
            <div className='mb-4 py-2'>
              <h3 className='font-anek-latin text-2xl text-gray-500 font-semibold'>Credentials</h3>
              <p className='text-gray-500'>Used by your ICON to login</p>
            </div>
            <FormGroup className='flex md:flex-row flex-col'>
              <div className='flex flex-row sm:w-1/2 w-1/2'>
                <GenericTextInput
                  plain={true} 
                  label='X account handler (without @)'
                  name='x_handler'
                  placeholder="Your X handler here"
                  onChange={(e) => handleFormChange('twitterUsername', e.target.value)}
                  onBlur={() => handleFieldBlur('twitterUsername')}
                  value={formState.twitterUsername}
                  required={true}
                  hasError={!!twitterUsernameError}
                  errorMessages={twitterUsernameError ? [twitterUsernameError] : []}
                />
              </div>
              {validating && field === 'twitterUsername' && (
                <div className="text-gray-500 flex items-center mt-1">
                  <i className="fa-solid fa-sync fa-spin mr-2"></i>
                  <span>Validating username...</span>
                </div>
              )}
            </FormGroup>
            <FormGroup className='flex md:flex-row flex-col'>
              <GenericTextInput
                plain={true} 
                label='X account password'
                name='x_password'
                type="password"
                onChange={(e) => handleFormChange('twitterPassword', e.target.value)}
                onBlur={() => handleFieldBlur('twitterPassword')}
                value={formState.twitterPassword}
                required={true}
                hasError={!!twitterPasswordError}
                errorMessages={twitterPasswordError ? [twitterPasswordError] : []}
              />
              <GenericTextInput
                plain={true} 
                label='X account email'
                name='x_email'
                placeholder="Your X mail here"
                onChange={(e) => handleFormChange('twitterEmail', e.target.value)}
                onBlur={() => handleFieldBlur('twitterEmail')}
                value={formState.twitterEmail}
                required={true}
                hasError={!!twitterEmailError}
                errorMessages={twitterEmailError ? [twitterEmailError] : []}
              />
            </FormGroup>
            {(validating && (field === 'twitterPassword' || field === 'twitterEmail')) && (
              <div className="text-gray-500 flex items-center mt-1 mb-4">
                <i className="fa-solid fa-sync fa-spin mr-2"></i>
                <span>Validating credentials...</span>
              </div>
            )}

            <Separator/>
            
            {/* Twitter cookies */}
            <div className='mb-4 py-2'>
              <h3 className='font-anek-latin text-2xl text-gray-500 font-semibold'>Cookies</h3>
              <p className='text-gray-500'>Your ICON will use them to login smoothly</p>
            </div>
            <FormGroup className='flex md:flex-row flex-col'>
              <GenericTextInput
                plain={true} 
                label='X account cookie auth_token'
                name='x_auth_token'
                placeholder="auth_token"
                onChange={(e) => handleFormChange('twitterAuthToken', e.target.value)}
                value={formState.twitterAuthToken}
              />
              <GenericTextInput
                plain={true} 
                label='X account cookie ct0'
                name='x_ct0'
                placeholder='ct0'
                onChange={(e) => handleFormChange('twitterCt0', e.target.value)}
                value={formState.twitterCt0}
              />
              <GenericTextInput
                plain={true} 
                label='X account cookie guest_id'
                name='x_guest_id'
                placeholder="guest_id"
                onChange={(e) => handleFormChange('twitterGuestId', e.target.value)}
                value={formState.twitterGuestId}
              />
            </FormGroup>

            <Separator/>
            
            {/* Twitter settings */}
            <div className='mb-4 py-2'>
              <h3 className='font-anek-latin text-2xl text-gray-500 font-semibold'>Way of work settings</h3>
              <p className='text-gray-500'>Configure your icon to run as you want</p>
            </div>
            <FormGroup className='flex md:flex-row flex-col'>
              <GenericCheckboxInput
                label='Generate a new post immediately the agent is started or every time is updated while is running'
                checked={formState.postImmediately}
                onChange={(e) => handleFormChange('postImmediately', e.target.checked)}
              />
            </FormGroup>
            
            <FormGroup className='flex md:flex-row flex-col sm:w-10/12 w-full'>
              <GenericNumberInput
                plain={true}
                label='Post min Interval Settings (in minutes)'
                name='post-interval-min'
                placeholder="90"
                onChange={(e) => handleFormChange('postIntervalMin', Number(e.target.value))}
                value={formState.postIntervalMin}
              />
              <GenericNumberInput
                plain={true}
                label='Post max Interval Settings (in minutes)'
                name='post-interval-max'
                placeholder="180"
                onChange={(e) => handleFormChange('postIntervalMax', Number(e.target.value))}
                value={formState.postIntervalMax}
              />
            </FormGroup>
            
            <FormGroup className='flex md:flex-row flex-col w-10/12 items-end'>
              <GenericNumberInput
                plain={true}
                label='How often (in seconds) the bot should check for interactions (mentions and replies)'
                name='poll-interval'
                placeholder="120"
                onChange={(e) => handleFormChange('pollInterval', Number(e.target.value))}
                value={formState.pollInterval}
              />
              <GenericSelectInput 
                selected={formState.actionTimelineType}
                onChange={(val) => handleFormChange('actionTimelineType', val)}
                values={[
                  {label:'Following', value: 'following'},
                  {label:'For you', value: 'foryou'},
                ]}
                label='Type of timeline to interact with.'
              />
            </FormGroup>
            
            <FormGroup className='flex md:flex-row flex-col w-10/12 w-full'>
              <GenericNumberInput
                plain={true} 
                label='Interval in minutes between timeline processing runs evaluating if some of the timeline posts need to be retweeted quoted or replied'
                name='action-interval'
                placeholder="5"
                onChange={(e) => handleFormChange('actionInterval', Number(e.target.value))}
                value={formState.actionInterval}
              />
              <GenericNumberInput
                plain={true} 
                label='Maximum number of actions (e.g., retweets, likes) to process in a single cycle. Helps prevent excessive or uncontrolled actions.'
                name='max-actions'
                placeholder="1"
                onChange={(e) => handleFormChange('maxActions', Number(e.target.value))}
                value={formState.maxActions}
              />
            </FormGroup>
          </div>
        )
      });
    }
    
    setAccordionItems(items);
  }, [
    showTelegramConfigForm, 
    showTwitterConfigForm, 
    formState,
    telegramTokenError,
    twitterUsernameError,
    twitterPasswordError,
    twitterEmailError,
    field,
    validating
  ]);

  return (
    <div className={forWizard ? "flex flex-col gap-4 flex-grow" : "p-4 border border-gray-700 rounded-lg flex flex-col gap-4"}>
      {!forWizard && (
        <div className="mb-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
            <i className="fa-solid fa-plug text-white"></i>
          </div>
          <h3 className="text-xl font-semibold">Client Configuration</h3>
        </div>
      )}

      <FormGroup className='!mb-0'>
        <ClientToggles
          availableClients={['telegram', 'twitter'] as Client[]}
          selectedClients={character.clients}
          onChange={(value: Client[]) => handleInputChange('clients', value)}
          label='Supported platforms'
        />
      </FormGroup>

      {/* Client settings accordion */}
      {accordionItems.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Supported platforms</h3>
          <Accordion items={accordionItems} />
        </div>
      ) : (
        character.clients.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg text-center text-white font-afacad flex flex-row items-center gap-2">
            <i className="fa-solid fa-sync fa-spin text-xl"></i>
            <span>Loading configuration options...</span>
          </div>
        )
      )}

      {/* Show tip section for wizard mode */}
      {forWizard && character.clients.length > 0 && (
        <div className="p-4 bg-gray-800 rounded-lg text-gray-300">
          <h4 className="font-semibold mb-2">
            <i className="fa-solid fa-circle-info mr-2"></i>
            Supported platforms Tips:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm ml-2">
            <li>Make sure to have the necessary API keys and credentials for each  platform</li>
            <li>For X/Twitter, you'll need your account credentials and optionally cookies</li>
            <li>For Telegram, you'll need a bot token from BotFather</li>
            <li>Adjust posting intervals to match your character's personality</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClientConfigurationSection;