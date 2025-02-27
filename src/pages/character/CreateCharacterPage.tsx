// src/pages/CreateCharacterPage.tsx
import React, { useEffect, useState } from 'react';
import CharacterEditor from '../../components/characterEditor/CharacterEditor';
import { useAuth } from '../../hooks/useAuth';
import SaveAgentButton from '../../components/agent/buttons/SaveAgentButton';
import { useAgentHooks } from '../../hooks/useAgentHooks';

const CreateCharacterPage: React.FC = () => {
  const { userProfile, loadUserProfile, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Use the hooks without an agentId since we're creating a new agent
  const { saveAgent, hasCharacterData } = useAgentHooks();

  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      loadUserProfile();
    }
  }, [isAuthenticated, userProfile, loadUserProfile]);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save and redirect to detail page on success
      await saveAgent({
        redirectTo: '/agent/:id',
        onSuccess: (data) => {
          console.log('Agent created successfully:', data);
        }
      });
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!userProfile) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div>
      {/* navigation */}
      <div className='p-4 border rounded-lg fixed bg-white shadow-xl right-6 top-[30%]'>
        <span className='fa-solid fa-gear text-xl fa-spin inline-flex'></span> 
        <div className='flex flex-col gap-4 mt-4'>
          <SaveAgentButton 
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving}
            hasCharacterData={hasCharacterData}
          />
        </div>
      </div>

      <CharacterEditor userId={userProfile.id}/>
    </div>
  );
};

export default CreateCharacterPage;