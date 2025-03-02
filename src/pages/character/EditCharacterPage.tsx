// src/pages/EditCharacterPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CharacterEditor from '../../components/characterEditor/CharacterEditor';
import { useAuth } from '../../hooks/useAuth';
import UpdateAgentButton from '../../components/agent/buttons/UpdateAgentButton';
import { useCharacter } from '../../hooks/useCharacter';
import { useAgentTransition } from '../../hooks/useAgentTransition';
import { useAgent } from '../../hooks/useAgent';
import { CharacterData } from '../../types';
import { useToasts } from '../../hooks/useToasts';
import { ApiKeyService } from '../../services/apiKeyService';
import Button from '../../components/common/Button';

const EditCharacterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile, loadUserProfile, isAuthenticated } = useAuth();
  const { character, loading, error } = useCharacter(id!);
  const { addNotification } = useToasts();
  
  // State for edited character data and model
  const [editedData, setEditedData] = useState<CharacterData | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const [shouldLoadUpdate, setShouldLoadUpdate] = useState<boolean>(false)
  
  // Use our hooks
  const { updateHandler } = useAgent();
  const { updateAgent } = useAgentTransition();

  // Load user profile if needed
  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      loadUserProfile();
    }
  }, [isAuthenticated, userProfile, loadUserProfile]);
  
  // Set initial data when character is loaded
  useEffect(() => {
    if (character) {
      setEditedData(character.definition);
      setSelectedModel(character.llm_provider_settings.llm_provider_model);
    }
  }, [character]);
  
  // Handle editor data changes
  const handleEditorChange = (data: CharacterData, model: string) => {
    setEditedData(data);
    setSelectedModel(model);
  };

  useEffect(() => {
    if (shouldLoadUpdate) {
      handleUpdate();
    }
  }, [shouldLoadUpdate])
  
  const handleUpdate = async () => {
    if (!userProfile?.id || !id || !editedData || !selectedModel) {
      setShouldLoadUpdate(false);
      addNotification('Missing data for updating the agent', 'error');
      return;
    }
    
    // Get API key from service
    const apiKey = ApiKeyService.getInstance().getApiKey();
    if (!apiKey) {
      setShouldLoadUpdate(false);
      addNotification('Please, introduce your Open Router API key', 'error');
      return;
    }
    
    try {
      // First update the character data with the edited data
      await updateHandler(
        id, 
        selectedModel,
        apiKey,
        editedData, 
        {
          onSuccess: async (_data) => {
            // Then trigger agent update in the runtime
            await updateAgent(userProfile.id, id);
            // Navigate back to detail page
            navigate(`/agent/${id}`);
          },
          onError: (error) => {
            if ('errors' in error) {
              // Format validation errors
              const messages = Object.entries(error.errors)
                .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                .join('; ');
              addNotification(`Failed to update agent: ${messages}`, 'error');
            } else {
              addNotification(`Failed to update agent: ${error.message}`, 'error');
            }
          }
        }
      );
    } catch (error) {
      console.error('Error updating agent:', error);
    } finally {
      setShouldLoadUpdate(false);
    }
  };
  
  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }
  
  if (!userProfile) {
    return <div>Loading profile...</div>;
  }
  
  if (loading) {
    return <div>Loading agent...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* navigation */}
      <div className='p-4 border rounded-lg fixed bg-white shadow-xl right-6 top-[30%] z-[10]'>
        <span className='fa-solid fa-gear text-xl fa-spin inline-flex'></span> 
        <div className='flex flex-col gap-4 mt-4'>
          <UpdateAgentButton 
            onClick={() => setShouldLoadUpdate(true)}
            loading={shouldLoadUpdate}
            disabled={shouldLoadUpdate}
          />
          <Button 
            onClick={() => navigate(`/agent/character/${character?.id}`)} 
            icon='fa-angle-left' 
            label={'Back'}
            disabled={shouldLoadUpdate}
          />
        </div>
      </div>

      <CharacterEditor 
        userId={userProfile.id} 
        characterData={character?.definition}
        selectedModel={character?.llm_provider_settings.llm_provider_model}
        onDataChange={handleEditorChange}
      />
    </div>
  );
};

export default EditCharacterPage;