// src/pages/EditCharacterPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CharacterEditor from '../../components/characterEditor/CharacterEditor';
import { useAuth } from '../../hooks/useAuth';
import UpdateAgentButton from '../../components/agent/buttons/UpdateAgentButton';
import { useAgentHooks } from '../../hooks/useAgentHooks';
import { useCharacter } from '../../hooks/useCharacter';

const EditCharacterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile, loadUserProfile, isAuthenticated } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { character, loading, error } = useCharacter(id!);

  // Use the hooks with the agentId from the URL
  const { updateAgent, hasAgentId, hasCharacterData, hasProviderData } = useAgentHooks(id!);

  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      loadUserProfile();
    }
  }, [isAuthenticated, userProfile, loadUserProfile]);
  
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Update and redirect to detail page on success
      await updateAgent({
        redirectTo: '/agent/:id',
        onSuccess: (data) => {
          console.log('Agent updated successfully:', data);
        }
      });
    } catch (error) {
      console.error('Error updating agent:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!isAuthenticated) {
    return <div>No estás autenticado.</div>;
  }
  
  if (!userProfile) {
    return <div>Cargando perfil...</div>;
  }
  
  if (loading) {
    return <div>Cargando agente...</div>;
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
            hasAgentId={hasAgentId}
            hasCharacterData={hasCharacterData}
            hasProviderData={hasProviderData}
          />
        </div>
      </div>

      <CharacterEditor 
        userId={userProfile.id} 
        agentId={id}
        characterData={character?.definition}
        selectedModel={character?.llm_provider_settings.llm_provider_model}
      />
    </div>
  );
};

export default EditCharacterPage;