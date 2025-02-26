//src/pages/character/CharacterDetailPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CiImageOn } from "react-icons/ci";
import { FaRegHeart } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";

import { formatDateFromString } from '../../utils/character';

import { useCharacter } from '../../hooks/useCharacter';
import { useAgentControls } from '../../hooks/useAgentControls';
import useAgentHooks from '../../hooks/useAgentHooks';

import ClientStatus from '../../components/agent/ClientStatus';
import AgentStatus from '../../components/agent/AgentStatus';
import Button from '../../components/common/Button';
import StartAgentButton from '../../components/agent/buttons/StartAgentButton';
import StopAgentButton from '../../components/agent/buttons/StopAgentButton';
import MasonryPostsLayout from '../../components/agent/MasonryPosts';

const CharacterDetailPage: React.FC = () => {
  let navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { character, loading, error } = useCharacter(id!);
  
  // Initialize context with character data when available
  const { agentStatus } = useAgentControls(
    id,
    character?.definition,
    character?.llm_provider_settings.llm_provider_name,
    character?.llm_provider_settings.llm_provider_model
  );
  
  // Get hooks for individual buttons
  const { isRunning, hasProviderData, startAgent, stopAgent } = useAgentHooks(id);

  if (loading) return <p>Loading character...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {/* summary */}
      <div className='flex sm:flex-row flex-col gap-4 mb-12'>
        {/* general */}
        <div className='flex flex-col gap-4 sm:w-8/12 w-full flex-grow '>
          <div className='px-4 py-2 bg-gray-50 border-gray-200 border rounded-lg'>
            <h2 className='font-semibold text-lg'>
              General
            </h2>
          </div>

          <div className='flex sm:flex-row flex-col items-center gap-4 border rounded-lg flex-grow'>
            <CiImageOn size={160} /> {/* TODO: Change by agent image */}

            <div className='flex flex-col gap-4 p-4 flex-grow'>
              {/* name, socials */}
              <div className='flex sm:flex-row flex-col-reverse sm:items-center sm:gap-0 gap-4 justify-between'>
                <div className='flex flex-row gap-6'>
                  {/* name */}
                  <div className='flex flex-col'>
                    <span className='text-sm text-black-light'>Name</span>
                    <span className='font-semibold'>{character?.definition.name}</span>
                  </div>
                  {/* status */}
                  <div className='flex flex-col flex-grow justify-end'>
                    <AgentStatus status={agentStatus} />
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
                {/* created at */}
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Created at</span>
                  <span className='font-semibold'>{formatDateFromString(character?.created_at!)}</span>
                </div>
                {/* model */}
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>LLM Model</span>
                  <span className='font-semibold'>{character?.llm_provider_settings.llm_provider_model}</span>
                </div>
                {/* total uptime */}
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Total uptime</span>
                  <span className='font-semibold'>--</span>
                </div>
                {/* current uptime */}
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Current uptime</span>
                  <span className='font-semibold'>--</span>
                </div>
                {/* publications */}
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Publications</span>
                  <span className='font-semibold'>--</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* clients */}
        <div className='flex flex-col gap-4 sm:w-4/12'>
          <div className='px-4 py-2 bg-gray-50 border-gray-200 border rounded-lg'>
            <h2 className='font-semibold text-lg'>
              Clients
            </h2>
          </div>

          <ClientStatus character={character} />
        </div>
      </div>

      {/* personality */}
      <div className='flex flex-col gap-4 w-full mb-12'>
        {/* section header */}
        <div className='px-4 py-2 bg-gray-50 border-gray-200 border rounded-lg'>
          <h2 className='font-semibold text-lg'>
            Personality definition
          </h2>
        </div>

        <div className='flex sm:flex-row flex-col gap-4'>
          {/* biography card*/}
          <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg sm:w-1/3 w-full">
            <div className="mx-3 mb-0 border-b border-slate-200 pt-3 pb-2 px-1">
                <span className="text-sm text-slate-500">
                  Biography
                </span>
            </div>
            <div className='p-4'>
              <h5 className="mb-2 text-slate-800 text-xl font-semibold">
                Biographical statements about the character
              </h5>
              <ul className="ml-6 list-disc text-slate-600 font-light">
                {character?.definition.style.all.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>

          {/* lore card*/}
          <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg sm:w-1/3 w-full">
            <div className="mx-3 mb-0 border-b border-slate-200 pt-3 pb-2 px-1">
                <span className="text-sm text-slate-500">
                  Lore
                </span>
            </div>
            <div className='p-4'>
              <h5 className="mb-2 text-slate-800 text-xl font-semibold">
                Backstory elements and unique character traits
              </h5>
              <ul className="ml-6 list-disc text-slate-600 font-light">
                {character?.definition.style.all.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>

          {/* topics */}
          <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg sm:w-1/3 w-full">
            <div className="mx-3 mb-0 border-b border-slate-200 pt-3 pb-2 px-1">
                <span className="text-sm text-slate-500">
                  Topics
                </span>
            </div>
            <div className='p-4'>
              <h5 className="mb-2 text-slate-800 text-xl font-semibold">
                Topics of interests
              </h5>
              <div className="text-slate-600 font-light flex flex-wrap gap-2">
                {character?.definition.topics.map((row: string, index: number) => (
                  <span className='capitalize px-3 text-sm py-1 border rounded-full' key={index}>{row}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* style */}
      <div className='flex flex-col gap-4 w-full mb-12'>
        {/* section header */}
        <div className='px-4 py-2 bg-gray-50 border-gray-200 border rounded-lg'>
          <h2 className='font-semibold text-lg'>
            Communication properties
          </h2>
        </div> 

        <div className='flex sm:flex-row flex-col gap-4'>
          {/* all style */}
          <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg sm:w-1/3 w-full">
            <div className="mx-3 mb-0 border-b border-slate-200 pt-3 pb-2 px-1">
                <span className="text-sm text-slate-500">
                  Generic properties
                </span>
            </div>
            <div className='p-4'>
              <h5 className="mb-2 text-slate-800 text-xl font-semibold">
                General style instructions for all interactions
              </h5>
              <ul className="ml-6 list-disc text-slate-600 font-light">
                {character?.definition.style.all.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>

          {/* chat style */}
          <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg sm:w-1/3 w-full">
            <div className="mx-3 mb-0 border-b border-slate-200 pt-3 pb-2 px-1">
              <span className="text-sm text-slate-500">
                Chat
              </span>
            </div>
            <div className='p-4'>
              <h5 className="mb-2 text-slate-800 text-xl font-semibold">
                Specific instructions for chat interactions
              </h5>
              <ul className="ml-6 list-disc text-slate-600 font-light">
                {character?.definition.style.chat.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>

          {/* post style */}
          <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg sm:w-1/3 w-full">
            <div className="mx-3 mb-0 border-b border-slate-200 pt-3 pb-2 px-1">
              <span className="text-sm text-slate-500">
                Post
              </span>
            </div>
            <div className='p-4'>
              <h5 className="mb-2 text-slate-800 text-xl font-semibold">
                Specific instructions for social media posts
              </h5>
              <ul className="ml-6 list-disc text-slate-600 font-light">
                {character?.definition.style.post.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>
        </div> 
      </div>

      {/* examples */}
      <div className='flex flex-col gap-4 w-full'>
        {/* section header */}
        <div className='px-4 py-2 bg-gray-50 border-gray-200 border rounded-lg'>
          <h2 className='font-semibold text-lg'>
            Sample social media posts to guide content style
          </h2>
        </div> 
        <MasonryPostsLayout posts={character?.definition.postExamples ?? []} username={character?.definition.name || 'Convolution'}></MasonryPostsLayout>
      </div>



      {/* navigation */}
      <div className='p-4 border rounded-lg fixed bg-white shadow-xl right-6 top-[30%]'>
        <span className='fa-solid fa-gear text-xl fa-spin inline-flex'></span>
        <div className='flex flex-col gap-4 mt-4'>
            {!isRunning && hasProviderData && (
              <StartAgentButton onClick={startAgent} />
            )}
            {isRunning && hasProviderData && (
              <StopAgentButton onClick={stopAgent} />
            )}
            <Button onClick={() => navigate(`/agent/character/${character?.id}`)} icon='fa-pencil' label={'Edit'}></Button>
        </div>
      </div>

    </>
  );
};

export default CharacterDetailPage;