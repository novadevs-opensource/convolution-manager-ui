//src/pages/character/CharacterDetailPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../../hooks/useCharacter';
import { formatDateFromString } from '../../utils/character';

import { CiImageOn } from "react-icons/ci";
import { FaRegHeart } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import ClientStatus from '../../components/agent/ClientStatus';
import AgentControlsSection from '../../components/characterEditor/AgentControlsSection';
import { useAuth } from '../../hooks/useAuth';
import AgentStatus from '../../components/agent/AgentStatus';
import { useAgentControls } from '../../hooks/useAgentControls';

const CharacterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { character, loading, error } = useCharacter(id!);
  const {userProfile} = useAuth();

  const {agentStatus} = useAgentControls(
    userProfile?.id, 
    character?.id, 
    character?.definition,
    character?.llm_provider_settings.llm_provider_name,
    character?.llm_provider_settings.llm_provider_model
  );

  if (loading) return <p>Loading character...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className='flex sm:flex-row flex-col gap-4 mb-8'>
        {/* general */}
        <div className='flex flex-col sm:w-8/12 w-full flex-grow '>
          <div className='px-4 py-2 mb-5 bg-gray-50 border-gray-200 border rounded-lg flex flex-row justify-between'>
            <h2 className='font-semibold text-lg'>
              General
            </h2>
            <AgentStatus status={agentStatus} />
          </div>

          <div className='flex sm:flex-row flex-col items-center gap-4 border rounded-lg flex-grow'>
            <CiImageOn size={160} /> {/* TODO: Change by agent image */}

            <div className='flex flex-col gap-4 p-4 flex-grow'>
              {/* name, socials */}
              <div className='flex sm:flex-row flex-col-reverse sm:items-center sm:gap-0 gap-4 justify-between'>
                <div className='flex flex-row'>
                  {/* name */}
                  <div className='flex flex-col'>
                    <span className='text-sm text-black-light'>Name</span>
                    <span className='font-semibold'>{character?.definition.name}</span>
                  </div>
                </div>
                {/* socials */}
                <div className='flex flex-row gap-4'>
                  <div className='flex flex-row items-center gap-2'>
                    <FaRegHeart size={18}/>
                    <span>--</span> {/* TODO */}
                  </div>
                  <div className='flex flex-row items-center gap-2'>
                    <FaRegUser size={18}/>
                    <span>--</span> {/* TODO */}
                  </div>
                </div>
              </div>

              {/* created_at, model, clients */}
              <div className='flex sm:flex-row flex-col gap-6'>
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Created at</span>
                  <span className='font-semibold'>{formatDateFromString(character?.created_at!)}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>LLM Model</span>
                  <span className='font-semibold'>{character?.llm_provider_settings.llm_provider_model}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Total uptime</span>
                  <span className='font-semibold'>--</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Current uptime</span>
                  <span className='font-semibold'>--</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Publications</span>
                  <span className='font-semibold'>--</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className='flex flex-col sm:w-4/12 w-full'>
          <AgentControlsSection userId={userProfile?.id} agentId={character?.id}  llm_provider_name={character?.definition.modelProvider} llm_provider_model={character?.definition.settings.secrets?.OPENROUTER_MODEL} />
        </div>
      </div>

      <div className='flex sm:flex-row flex-col gap-4 mb-8'>
        {/* Bio */}
        <div className='flex flex-col gap-4 sm:w-4/12'>
          <div className='px-4 py-2 bg-gray-50 border-gray-200 border rounded-lg'>
            <h2 className='font-semibold text-lg'>
              Clients
            </h2>
          </div>

          <ClientStatus character={character} />
        </div>
        {/* Clients */}
        <div className='flex flex-col gap-4 sm:w-4/12'>
          <div className='px-4 py-2 bg-gray-50 border-gray-200 border rounded-lg'>
            <h2 className='font-semibold text-lg'>
              Clients
            </h2>
          </div>

          <ClientStatus character={character} />
        </div>
      </div>
    </>
  );
};

export default CharacterDetailPage;
