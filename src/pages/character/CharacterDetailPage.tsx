// src/pages/character/CharacterDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MessageExample } from '../../types';

import { formatDateFromString, formatSeconds } from '../../utils/character';
import { useCharacter } from '../../hooks/useCharacter';
import { useRuntimeStatus } from '../../hooks/useRuntimeStatus';
import { useAgentTransition } from '../../hooks/useAgentTransition';
import { useAgentAckEvents } from '../../hooks/useAgentAckEvents'; // Keep using the original hook name
import { useAvatarEvents } from '../../hooks/useAvatarEvents';
import { useAuth } from '../../hooks/useAuth';

import { GenerateAvatarResponseEvent } from '../../types/commEvents';

import ClientStatus from '../../components/agent/ClientStatus';
import AgentStatus from '../../components/agent/AgentStatus';
import Button from '../../components/common/Button';
import StartAgentButton from '../../components/agent/buttons/StartAgentButton';
import StopAgentButton from '../../components/agent/buttons/StopAgentButton';
import MasonryPostsLayout from '../../components/agent/MasonryPosts';

import convolutionLogoBlack from '../../assets/images/convolution-square-black.svg';
import ActionToolsBlock from '../../components/common/ActionToolsBlock';
import GenericTextArea from '../../components/inputs/GenericTextArea';
import { useToasts } from '../../hooks/useToasts';
import Modal from '../../components/common/Modal';
import useModal from '../../hooks/useModal';

const CharacterDetailPage: React.FC = () => {
  let navigate = useNavigate();
  const { addNotification } = useToasts();
  const { id } = useParams<{ id: string }>();
  const { character, loading: characterLoading, error: characterError } = useCharacter(id!);
  const { userProfile } = useAuth();
  const avatarModal = useModal();
  
  // Use hooks for status
  const { statusData, isRunning } = useRuntimeStatus(id!, 5000);
  const [totalUptime, setTotalUptime] = useState<number>(0);
  const [currentUptime, setCurrentUptime] = useState<number>(0);
  
  // Use hooks for transitions
  const { startAgent, stopAgent, loading: transitionLoading } = useAgentTransition();
  const [shouldLoadBoot, setShouldLoadBoot] = useState<boolean>(false);
  const [shouldLoadStop, setShouldLoadStop] = useState<boolean>(false);

  const [avatarPromt, setAvatarPromt] = useState<string>();
  // Just for DEBUG const avatarFromGeneration = "http://127.0.0.1:4566/convolution-localstack-bucket/done/image.png"

  // Use avatar events hook
  const { 
    latestImageUrl: avatarFromGeneration, 
    isGenerating: isGeneratingAvatar,
    generateAvatar,
  } = useAvatarEvents({
    agentId: id,
    pollingInterval: 5000,
    onFinalEvent: (event: GenerateAvatarResponseEvent) => handleSaveFinalAvatarUrl(event.image_url)
  });
  
  // Use agent ACK events hook with autoRefreshStatus=true
  // This will automatically refresh the status when an ACK event is received
  // Keep using useAgentAckEvents for backward compatibility
  useAgentAckEvents({ 
    agentId: id,
    pollingInterval: 5000,
    autoRefreshStatus: true
  });
  
  // Handle agent start
  const handleStartAgent = async () => {
    if (!userProfile?.id || !id) return;
    
    await startAgent(userProfile.id, id);
  };

  // Handle agent stop
  const handleStopAgent = async () => {
    if (!userProfile?.id || !id) return;
    
    await stopAgent(userProfile.id, id);
  };

  useEffect(() => {
    if (shouldLoadBoot) {
      handleStartAgent();
    }
    if (shouldLoadStop) {
      handleStopAgent();
    }
  }, [shouldLoadBoot, shouldLoadStop]);

  useEffect(() => {
    if (statusData?.status === "running") {
      setShouldLoadBoot(false);
      setShouldLoadStop(false);
    }
    if (statusData?.status === "stopped") {
      setShouldLoadBoot(false);
      setShouldLoadStop(false);
    }

    setCurrentUptime(Math.round(statusData?.current_uptime || 0));
    setTotalUptime(Math.round((statusData?.uptime_total_seconds || 0) + (currentUptime || 0)));

    // The code below is to increase uptimes second by second instead of waiting for every backend refresh
    const intervalId = setInterval(() => {
      setTotalUptime((prevCounter: number) => prevCounter + (statusData?.status === "running" ? 1 : 0));
      setCurrentUptime((prevCounter: number) => prevCounter + (statusData?.status === "running" ? 1 : 0));
    }, 1000);

    // Clear interval when component is unmounted
    return () => clearInterval(intervalId);
  }, [statusData]);

  /**
   * Handle avatar generation request
   */
  const handleGenerateAvatar = async () => {
    if (!userProfile?.id || !character?.id || !avatarPromt || avatarPromt.length < 20) {
      addNotification('Prompt must be at least 20 characters length', 'error')
      return;
    };
    
    await generateAvatar(avatarPromt);
  };

  const handleSaveFinalAvatarUrl = (url: string) => {
    console.log(url);
    avatarModal.close();
    // TODO: Backend request to update avatar
  }

  if (characterLoading) return <p>Loading character...</p>;
  if (characterError) return <p>Error: {characterError}</p>;


  return (
    <>
      {/* summary */}
      <div className='flex md:flex-row flex-col gap-4 mb-12'>
        {/* general */}
        <div className='flex flex-col gap-4 sm:w-8/12 w-full flex-grow '>
          <div className='px-4 py-2 bg-gray-50 border-gray-200 border rounded-lg'>
            <h2 className='font-semibold text-lg'>
              General
            </h2>
          </div>

          <div className='flex md:flex-row flex-col items-center gap-4 border rounded-lg flex-grow p-4'>
            {!avatarFromGeneration ? (
              <div 
                className='p-4 cursor-pointer'
                onClick={() => avatarModal.open()} 
              >
                <img src={convolutionLogoBlack} className={`h-[100px] w-[100px] animate-pulse`} alt="convolution logo"/>
              </div>
            ) : (
              <div 
                className={`h-[100px] w-[100px] flex !bg-cover cursor-pointer hover:opacity-60 ease-in-out duration-300 `}
                style={{background: `url(${avatarFromGeneration}`}} 
                onClick={() => avatarModal.open()} 
              />
            )}
            

            <div className='flex flex-col gap-4 flex-grow sm:w-auto w-full'>
              {/* name, status */}
              <div className='flex md:flex-row flex-col-reverse sm:items-center sm:gap-0 gap-4 justify-between relative'>
                <div className='flex md:flex-row flex-col gap-6'>
                  {/* name */}
                  <div className='flex flex-row gap-4'>
                    <div className='flex flex-col'>
                      <span className='text-sm text-black-light'>Name</span>
                      <span className='font-semibold'>{character?.definition.name}</span>
                    </div>
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm text-black-light'>LLM Model</span>
                    <span className='font-semibold'>{character?.llm_provider_settings.llm_provider_model}</span>
                  </div>
                </div>
                {/* status */}
                <div className='flex flex-col self-end sm:relative absolute top-0'>
                  <AgentStatus id={character?.id!} />
                </div>
              </div>

              {/* created_at, model, clients */}
              <div className='flex md:flex-row flex-col gap-6'>
                {/* created at */}
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Created at</span>
                  <span className='font-semibold'>{formatDateFromString(character?.created_at!)}</span>
                </div>
                {/* total uptime */}
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Total uptime</span>
                  <span className='font-semibold'>{formatSeconds(totalUptime)}</span>
                </div>
                {/* current uptime */}
                <div className='flex flex-col'>
                  <span className='text-sm text-black-light'>Current uptime</span>
                  <span className='font-semibold'>{formatSeconds(currentUptime)}</span>
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

        <div className='flex md:flex-row flex-col gap-4'>
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

        <div className='flex md:flex-row flex-col gap-4'>
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
      
        <div className='flex md:flex-row flex-col gap-4 mb-[600px]'>
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
      <ActionToolsBlock>
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
          label={`Edit ICON settings`}
          disabled={shouldLoadBoot || shouldLoadStop || statusData?.status === "unknown"}
        />
        <Button 
          onClick={() => avatarModal.open()} 
          icon={isGeneratingAvatar ? 'fa fa-spin fa-gear' : 'fa fa-image'}
          label={isGeneratingAvatar ? 'Generating avatar...' : 'Generate avatar'}
          disabled={isGeneratingAvatar}
          className='animate-pulse'
        />
      </ActionToolsBlock>

      {/* avatar modal */}
      <Modal
        ref={avatarModal.modalRef}
        title="Add face to your ICON"
        animation='slide'
        animationDuration={300}
        maxWidth={'lg'}
        footer={
          <div className='w-full'>
            <div className='flex flex-row gap-2'>
              <Button 
                onClick={() => handleGenerateAvatar()} 
                label={'Create vision face'}
                disabled={true}
                className='!px-6'
              />
              <Button 
                onClick={() => handleGenerateAvatar()} 
                icon={isGeneratingAvatar ? 'fa fa-spin fa-gear' : 'fa fa-image'}
                label={isGeneratingAvatar ? 'Creating face...' : 'Create anime face'}
                disabled={isGeneratingAvatar || !avatarPromt }
                className='!px-6'
              />
            </div>
          </div>
        }
      >
        {!avatarFromGeneration ? (
          <div className='justify-center flex flex-row'>
            {isGeneratingAvatar ? (
              <div className={`h-[250px] w-full flex justify-center items-center gap-2 border rounded-md`}>
                <i className='fa fa-gear fa-spin'/>
                <span>Your request is in queue...</span>
              </div>
            ) : (
              <div className='p-4 border rounded-md w-full flex justify-center'>
                <img src={convolutionLogoBlack} className={`h-[250px] w-[250px] opacity-10 self-center`} alt="convolution logo"/>
              </div>
            )}
          </div>
        ) : (
          <div className='flex items-center justify-center m-auto size-fit group'>
            <Button 
              className='!p-4 absolute duration-300 group-hover:opacity-100 opacity-0 transition-opacity z-10' 
              onClick={() => {
                const downloadImage = (url: string) => {
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = url.split('/').pop() || 'image.png';
                  
                  link.style.display = 'none';
                  link.click();
                };
                
                downloadImage(avatarFromGeneration);
              }}
              icon="fa fa-download"
            />
            <div 
              className={`h-[250px] w-[250px] flex !bg-cover cursor-pointer group-hover:opacity-60 ease-in-out duration-300`}
              style={{background: `url(${avatarFromGeneration}`}} 
            />
          </div>
        )}
        <GenericTextArea
          placeholder="Write an example user message..."
          className="user-message"
          value={avatarPromt}
          onChange={(e) => setAvatarPromt(e.target.value)}
          plain={true}
          maxLength={200}
          showCharCount={true}
          disabled={isGeneratingAvatar}
        />
      </Modal>
    </>
  );
};

export default CharacterDetailPage;