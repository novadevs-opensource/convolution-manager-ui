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
  const [showTelegramConfigForm, setShowTelegramConfigForm] = useState<boolean>(false);
  const [showTwitterConfigForm, setShowTwitterConfigForm] = useState<boolean>(false);
  // Define accordionItems as a state to trigger re-renders
  const [accordionItems, setAccordionItems] = useState<AccordionItem[]>([]);

  // Update visibility based on selected clients
  useEffect(() => {
    setShowTelegramConfigForm(character.clients.includes('telegram'));
    setShowTwitterConfigForm(character.clients.includes('twitter'));
  }, [character.clients]);

  // Update accordion items when client visibility changes
  useEffect(() => {
    const newAccordionItems: AccordionItem[] = [];
    
    // Add Telegram item if needed
    if (showTelegramConfigForm) {
      newAccordionItems.push({
        title: "Telegram",
        content: (
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
          </FormGroup>
        )
      });
    }
    
    // Add Twitter/X item if needed
    if (showTwitterConfigForm) {
      newAccordionItems.push({
        title: "X",
        content: (
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
            <FormGroup className='flex md:flex-row flex-col sm:w-10/12 w-full'>
              <GenericNumberInput
                plain={true}
                label='Post min Interval Settings (in minutes)'
                name='post-interval-min'
                placeholder="90"
                onChange={(e) => handleInputChange('settings.POST_INTERVAL_MIN', Number(e.target.value))}
                value={character.settings?.POST_INTERVAL_MIN ?? 90}
              />
              <GenericNumberInput
                plain={true}
                label='Post max Interval Settings (in minutes)'
                name='post-interval-max'
                placeholder="180"
                onChange={(e) => handleInputChange('settings.POST_INTERVAL_MAX', Number(e.target.value))}
                value={character.settings?.POST_INTERVAL_MAX ?? 180}
              />
            </FormGroup>
            
            <FormGroup className='flex md:flex-row flex-col w-10/12 items-end'>
              <GenericNumberInput
                plain={true}
                label='How often (in seconds) the bot should check for interactions (mentions and replies)'
                name='poll-interval'
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
            
            <FormGroup className='flex md:flex-row flex-col w-10/12 w-full'>
              <GenericNumberInput
                plain={true} 
                label='Interval in minutes between timeline processing runs evaluating if some of the timeline posts need to be retweeted quoted or replied'
                name='action-interval'
                placeholder="5"
                onChange={(e) => handleInputChange('settings.ACTION_INTERVAL', Number(e.target.value))}
                value={character.settings?.ACTION_INTERVAL ?? 5}
              />
              <GenericNumberInput
                plain={true} 
                label='Maximum number of actions (e.g., retweets, likes) to process in a single cycle. Helps prevent excessive or uncontrolled actions.'
                name='max-actions'
                placeholder="1"
                onChange={(e) => handleInputChange('settings.MAX_ACTIONS_PROCESSING', Number(e.target.value))}
                value={character.settings?.MAX_ACTIONS_PROCESSING ?? 1}
              />
            </FormGroup>
          </>
        )
      });
    }
    
    // Update the accordion items state
    setAccordionItems(newAccordionItems);
  }, [showTelegramConfigForm, showTwitterConfigForm, character, handleInputChange]);

  return (
    <div className={forWizard ? "flex flex-col gap-6 flex-grow" : "p-4 border border-gray-700 rounded-lg flex flex-col gap-6"}>
      {!forWizard && (
        <div className="mb-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
            <i className="fa-solid fa-plug text-white"></i>
          </div>
          <h3 className="text-xl font-semibold">Client Configuration</h3>
        </div>
      )}

      <FormGroup>
        <ClientToggles
          availableClients={['telegram', 'twitter'] as Client[]}
          selectedClients={character.clients}
          onChange={(value: Client[]) =>
            handleInputChange('clients', value)
          }
          label='Available clients'
        />
      </FormGroup>

      {/* Client settings accordion */}
      {accordionItems.length > 0 ? (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Client Settings</h4>
          <Accordion items={accordionItems} />
        </div>
      ) : (
        character.clients.length > 0 ? (
          <div className="bg-gray-800 p-4 rounded-lg text-center text-gray-400">
            <i className="fa-solid fa-sync fa-spin mr-2"></i>
            <span>Loading configuration options...</span>
          </div>
        ) : (
          <div className="bg-gray-800 p-4 rounded-lg text-center text-white font-afacad flex flex-row items-center gap-2">
            <i className="fa-solid fa-info-circle text-xl"></i>
            <p>Select at least one client to configure its settings</p>
          </div>
        )
      )}

      {/* Show tip section for wizard mode */}
      {forWizard && character.clients.length > 0 && (
        <div className="p-4 bg-gray-800 rounded-lg text-gray-300">
          <h4 className="font-semibold mb-2">
            <i className="fa-solid fa-circle-info mr-2"></i>
            Client Settings Tips:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Make sure to have the necessary API keys and credentials for each client</li>
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