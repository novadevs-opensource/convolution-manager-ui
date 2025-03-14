// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import FormGroup from '../components/common/FormGroup';
import GenericTextInput from '../components/inputs/GenericTextInput';
import CharacterEditorSection from '../components/characterEditor/CharacterEditorSection';
import { useLLMProviderApiKey } from '../hooks/useLLMProviderApiKey';
import { useToasts } from '../hooks/useToasts';
import { getTokenBalance } from '../utils/web3/getTokenBalance';
import convolutionLogoBlack from '../assets/images/convolution-square-black.svg';
import openRouterLogoBlack from '../assets/images/openrouter-logo.svg';

const ProfilePage: React.FC = () => {
  const { addNotification } = useToasts();
  const { userProfile, isAuthenticated } = useAuth();
  // Use the API key hook with the user's id (if available)
  const { key, updateHandler,removeHandler, error, creditsData, updateResponse } = useLLMProviderApiKey();
  // Local state to manage the API key input field
  const [apiKeyInput, setApiKeyInput] = useState<string>(key || '');
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);


  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Save button click handler: update the API key via the hook.
  const handleSaveApiKey = async () => {
    if (apiKeyInput) {
      await updateHandler(apiKeyInput);
    }
  };

  // Log errors when they occur
  useEffect(() => {
    if (error) {
      addNotification(error, "error");
    }
  }, [error]);

  useEffect(() => {
    if (updateResponse) {
      addNotification(updateResponse.message, "success");
    }
  }, [updateResponse])


  // Fetch token balance when wallet address changes.
  useEffect(() => {
    const fetchBalance = async () => {
      if (userProfile?.wallet_address) {
        // Ensure the mint address is a string from your environment variables.
        const balance = await getTokenBalance(
          userProfile.wallet_address,
          import.meta.env.VITE_TOKEN_MINT as string
        );
        setTokenBalance(balance.uiBalance);
      }
    };
    fetchBalance();
  }, [userProfile?.wallet_address]);

  const handleRemoveApiKey = () => {
    // Implement removal functionality as needed.
    removeHandler();
    setApiKeyInput('');
  };

  return (
    <div className='sm:grid sm:grid-cols-2 flex flex-col gap-4'>
      <CharacterEditorSection title={'Wallet data'} headerIcon={<i className="fa fa-user"></i>}>
        <FormGroup>
          <GenericTextInput 
            className='w-full bg-gray-50 !border-gray-200'
            label="Wallet"
            iconSource={<i className="fa fa-wallet"></i>}
            value={userProfile?.wallet_address || ''}
            disabled={true}
            plain={true}
          />
          <div className="shadow-md relative flex flex-grow !flex-row flex-col items-center rounded-md border-[1px] bg-gray-50 border-gray-200 bg-clip-border">
            <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
              <div className="rounded-full bg-lightPrimary p-3 ">
                <span className="flex items-center text-brand-500 ">
                  <img src={convolutionLogoBlack} className="h-[24px]" alt="convolution logo"/>
                </span>
              </div>
            </div>
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
              <p className="font-dm text-sm font-medium text-gray-600">$CNVLTN balance</p>
              <h4 className="text-xl font-bold text-navy-700 ">{tokenBalance}</h4>
            </div>
          </div>
        </FormGroup>

      </CharacterEditorSection>
      <CharacterEditorSection title={'API key'} headerIcon={<i className="fa fa-key"></i>}>
        <FormGroup>
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <GenericTextInput 
              label="OpenRouter API key"
              iconSource={<i className="fa fa-key"></i>}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              plain={true}
            />
            <div className='flex flex-row gap-2 sm:self-end self-start'>
              {key && (
                <button
                  id="remove-key"
                  className="shadow-md border-2 border-black bg-black hover:bg-white text-white hover:text-black rounded-md h-fit py-2 px-3 mb-4"
                  title="Remove API Key"
                  onClick={handleRemoveApiKey}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              )}
              {apiKeyInput && (
                <button
                  id="save-key"
                  className="shadow-md border-2 border-black bg-black hover:bg-white text-white hover:text-black rounded-md h-fit py-2 px-3 mb-4"
                  title="Save API Key"
                  onClick={handleSaveApiKey}
                >
                  <i className="fa-solid fa-save"></i>
                </button>
              )}
            </div>
          </div>
        </FormGroup>
        {creditsData && (
          <div className="shadow-md relative flex flex-grow !flex-row flex-col items-center rounded-md border-[1px] bg-gray-50 border-gray-200 bg-clip-border ">
            <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
              <div className="rounded-full bg-lightPrimary p-3 ">
                <span className="flex items-center text-brand-500 ">
                  <img src={openRouterLogoBlack} className="h-[24px]" alt="convolution logo"/>
                </span>
              </div>
            </div>
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
              <p className="font-dm text-sm font-medium text-gray-600">Credits balance</p>
              <h4 className="text-xl font-bold text-navy-700 ">{creditsData?.data.total_credits}</h4>
            </div>
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
              <p className="font-dm text-sm font-medium text-gray-600">Used credits</p>
              <h4 className="text-xl font-bold text-navy-700 ">{creditsData?.data.total_usage}</h4>
            </div>
          </div>
        )}
      </CharacterEditorSection>
    </div>
  );
};

export default ProfilePage;
