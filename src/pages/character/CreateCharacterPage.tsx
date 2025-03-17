// src/pages/CreateCharacterPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterEditor from '../../components/characterEditor/CharacterEditor';
import { useAuth } from '../../hooks/useAuth';
import SaveAgentButton from '../../components/agent/buttons/SaveAgentButton';
import { useAgent } from '../../hooks/useAgent';
import { ApiKeyService } from '../../services/apiKeyService';
import { useToasts } from '../../hooks/useToasts';
import { CharacterData } from '../../types';
import Button from '../../components/common/Button';
import ActionToolsBlock from '../../components/common/ActionToolsBlock';

const CreateCharacterPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loadUserProfile, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { saveHandler } = useAgent();
  const { addNotification } = useToasts();
  
  // Load user profile if needed
  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      loadUserProfile();
    }
  }, [isAuthenticated, userProfile, loadUserProfile]);
  
  const handleSave = async () => {
    if (!userProfile?.id || !characterData || !selectedModel) {
      addNotification('Missing data saving settings', 'error');
      return;
    }
    
    // Get API key from service
    const apiKey = ApiKeyService.getInstance().getApiKey();
    if (!apiKey) {
      addNotification('Please, introduce your Open Router API key', 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      // Save and redirect to detail page on success
      await saveHandler(
        userProfile.id, 
        selectedModel, 
        apiKey, 
        characterData,
        {
          onSuccess: (data) => {
            addNotification('Agent created successfully', 'success');
            navigate(`/agent/${data.character.id}`);
          },
          onError: (error) => {
            if ('errors' in error) {
              // Format validation errors
              const messages = Object.entries(error.errors)
                .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                .join('; ');
              addNotification(`Failed to create agent: ${messages}`, 'error');
            } else {
              addNotification(`Failed to create agent: ${error.message}`, 'error');
            }
          }
        }
      );
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle editor updates
  const handleEditorChange = (data: CharacterData, model: string) => {
    setCharacterData(data);
    setSelectedModel(model);
  };
  
  if (!userProfile) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div>
      {/* navigation */}
        <ActionToolsBlock>
          <SaveAgentButton 
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving || !characterData}
            hasCharacterData={!!characterData}
            showAlways={true}
          />
          <Button 
            onClick={() => navigate(`/dashboard`)} 
            icon='fa-angle-left' 
            label={'Back'}
          />
        </ActionToolsBlock>

      <CharacterEditor 
        userId={userProfile.id}
        onDataChange={handleEditorChange}
      />
    </div>
  );
};

export default CreateCharacterPage;