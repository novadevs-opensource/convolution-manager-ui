// src/pages/EditCharacterPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CharacterEditor from '../../components/characterEditor/CharacterEditor';
import { useAuth } from '../../hooks/useAuth';
import UpdateAgentButton from '../../components/agent/buttons/UpdateAgentButton';
import { useCharacter } from '../../hooks/useCharacter';
import { useAgentTransition } from '../../hooks/useAgentTransition';
import { useAgent } from '../../hooks/useAgent';

const EditCharacterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile, loadUserProfile, isAuthenticated } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { character, loading, error } = useCharacter(id!);
  
  // Use our new hooks
  const { updateHandler } = useAgent();
  const { updateAgent } = useAgentTransition();

  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      loadUserProfile();
    }
  }, [isAuthenticated, userProfile, loadUserProfile]);
  
  const handleUpdate = async () => {
    if (!userProfile?.id || !id || !character) return;
    
    setIsUpdating(true);
    try {
      // First update the character data
      await updateHandler(
        id, 
        character.llm_provider_settings.llm_provider_model,
        character.llm_provider_settings.llm_provider_api_key,
        character.definition, 
        {
          onSuccess: async () => {
            // Then trigger agent update in the runtime
            await updateAgent(userProfile.id, id);
            
            // Navigate back to detail page
            navigate(`/agent/${id}`);
          }
        }
      );
    } catch (error) {
      console.error('Error updating agent:', error);
    } finally {
      setIsUpdating(false);
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
            onClick={handleUpdate}
            loading={isUpdating}
            disabled={isUpdating}
          />
        </div>
      </div>

      <CharacterEditor 
        userId={userProfile.id} 
        characterData={character?.definition}
        selectedModel={character?.llm_provider_settings.llm_provider_model}
      />
    </div>
  );
};

export default EditCharacterPage;