// src/pages/character/CharacterDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CiImageOn } from "react-icons/ci";
import { FaRegHeart, FaRegUser } from "react-icons/fa6";

import { formatDateFromString } from '../../utils/character';
import { useCharacter } from '../../hooks/useCharacter';
import { useRuntimeStatus } from '../../hooks/useRuntimeStatus';
import { useAgentTransition } from '../../hooks/useAgentTransition';
import { useAgentAckEvents } from '../../hooks/useAgentAckEvents';
import { useAuth } from '../../hooks/useAuth';

import ClientStatus from '../../components/agent/ClientStatus';
import AgentStatus from '../../components/agent/AgentStatus';
import Button from '../../components/common/Button';
import StartAgentButton from '../../components/agent/buttons/StartAgentButton';
import StopAgentButton from '../../components/agent/buttons/StopAgentButton';
import MasonryPostsLayout from '../../components/agent/MasonryPosts';
import { MessageExample } from '../../types';

const CharacterDetailPage: React.FC = () => {
  let navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { character, loading: characterLoading, error: characterError } = useCharacter(id!);
  const { userProfile } = useAuth();
  
  // Use hooks for status and transitions
  const { statusData, isRunning, refetch: _refreshStatus } = useRuntimeStatus(id!, 5000);
  const { startAgent, stopAgent, loading: transitionLoading } = useAgentTransition();

  const [shouldLoadBoot, setShouldLoadBoot] = useState<boolean>(false);
  const [shouldLoadStop, setShouldLoadStop] = useState<boolean>(false);
  
  // Use agent ACK events hook with autoRefreshStatus=true so it will
  // automatically refresh the status when an ACK event is received
  // No need for a separate effect to do this
  useAgentAckEvents({ 
    agentId: id,
    pollingInterval: 3000,
    autoRefreshStatus: true
  });
  
  // Handle agent start
  const handleStartAgent = async () => {
    if (!userProfile?.id || !id) return;
    
    await startAgent(userProfile.id, id);
  };

  useEffect(() => {
    if (shouldLoadBoot) {
      handleStartAgent();
    }
    if (shouldLoadStop) {
      handleStopAgent();
    }
  }, [shouldLoadBoot, shouldLoadStop])

  useEffect(() => {
    if (statusData?.status === "running") {
      setShouldLoadBoot(false);
      setShouldLoadStop(false);
    }
    if (statusData?.status === "stopped") {
      setShouldLoadBoot(false);
      setShouldLoadStop(false);
    }
  }, [statusData])
  
  // Handle agent stop
  const handleStopAgent = async () => {
    if (!userProfile?.id || !id) return;
    
    await stopAgent(userProfile.id, id);
  };

  if (characterLoading) return <p>Loading character...</p>;
  if (characterError) return <p>Error: {characterError}</p>;

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

            <div className='flex flex-col gap-4 p-4 flex-grow w-full'>
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
                    <AgentStatus id={character?.id!} />
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
                  <span className='font-semibold'>{statusData?.last_boot_execution || 0}</span>
                </div>
                {/* current uptime */}
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Current uptime</span>
                  <span className='font-semibold'>{statusData?.last_stop_execution || 0}</span>
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

      {/* social media post and chat examples */}
      <div className='flex flex-col gap-4 w-full mb-1'>
        {/* section header */}
        <div className='px-4 py-2 bg-gray-50 border-gray-200 border rounded-lg'>
          <h2 className='font-semibold text-lg'>
            Sample conversations for establishing interaction patterns, help establish the character's conversational style.
          </h2>
        </div>
      
        <div className='flex sm:flex-row flex-col gap-4 mb-[600px]'>
          {/* chat */}
          <div className="relative bg-white p-6 rounded-lg border border-[#e5e7eb] sm:w-[440px] w-full">
            {/* Heading */}
            <div className="p-6 flex flex-col space-y-1.5">
              <h2 className="font-semibold text-lg tracking-tight">Chatbot</h2>
              <p className="text-sm text-[#6b7280] leading-3">Powered by Convolution</p>
            </div>
            {/* Chat Container */}
            <div className="h-[500px] border border-gray-200" style={{overflowY: 'scroll'}}>
              <div className="h-[200px] bg-gray-50  p-4" style={{minWidth: '100%', display: 'table'}}>
              {character?.definition.messageExamples.map((conversation: MessageExample[], index: number) => (
                <div key={index}>
                {conversation.map((message: MessageExample, messageIndex: number) => (
                  message.user === "{{user1}}" || message.user === "You" ? (
                    //  User Chat Message
                    <div key={messageIndex} className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
                      <span className="flex flex-col rounded-full w-9 h-9">
                        <div className="rounded-full bg-gray-100 border p-1">
                          <svg stroke="none" fill="black" strokeWidth="0" viewBox="0 0 16 16" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z">
                            </path>
                          </svg>
                        </div>
                      </span>
                      <div className="leading-relaxed">
                        <span className="block font-bold text-gray-700">You</span>
                        <div className='bg-gray-200 p-8 rounded-b-[35px] rounded-tl-[35px]'>
                          {message.content.text}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Chat Message AI
                    <div key={messageIndex} className="flex flex-row-reverse gap-3 my-4 text-gray-600 text-sm">
                      <span className="flex flex-col w-9 h-9">
                        <div className="rounded-full bg-gray-100 border p-1">
                          <svg stroke="none" fill="black" strokeWidth="1.5" viewBox="0 0 25 25" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z">
                            </path>
                          </svg>
                        </div>
                      </span>
                      <div key={messageIndex} className="leading-relaxed">
                        <span className="block font-bold text-gray-700 text-right capitalize">{character?.definition.name}</span>
                        <div className='bg-gray-200 p-8 rounded-b-[35px] rounded-tl-[35px]'>
                          {message.content.text}
                        </div>
                      </div>
                    </div>
                  )
                ))}
                </div>
              ))}
              </div>
            </div>
            {/* Input box  */}
            <div className="z-[9000] bottom-0 w-full h-[50px] bg-white flex items-center p-4">
              <form className="flex items-center justify-center w-full space-x-2">
                <input disabled className="disabled:opacity-75 flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2" placeholder="Type your message" value=""/>
                <button disabled className="disabled:opacity-50 inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-2">
                  Send
                </button>
              </form>
            </div>
          </div>
          {/* social media examples */}
          <MasonryPostsLayout scroll={true} scrollSize={600} columns={3} posts={character?.definition.postExamples ?? []} username={character?.definition.name || 'Convolution'}></MasonryPostsLayout>
        </div>
      </div>

      {/* navigation */}
      <div className='p-4 border rounded-lg fixed bg-white shadow-xl right-6 top-[30%]'>
        <span className='fa-solid fa-gear text-xl fa-spin inline-flex'></span>
        <div className='flex flex-col gap-4 mt-4'>
          <StartAgentButton 
            onClick={() => setShouldLoadBoot(true)} 
            isRunning={isRunning} 
            loading={shouldLoadBoot || transitionLoading || statusData?.status === "unknown"} 
          />
          <StopAgentButton 
            onClick={() => setShouldLoadStop(true)} 
            isRunning={isRunning} 
            loading={shouldLoadStop || transitionLoading || statusData?.status === "unknown"} 
          />
          <Button 
            onClick={() => navigate(`/agent/character/${character?.id}`)} 
            icon='fa-pencil' 
            label={'Edit'}
            disabled={shouldLoadBoot || shouldLoadStop || statusData?.status === "unknown"}
          />
        </div>
      </div>
    </>
  );
};

export default CharacterDetailPage;