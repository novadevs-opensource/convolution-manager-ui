// src/pages/character/CharacterDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MessageExample } from '../../types';

import { formatDateFromString, formatSeconds } from '../../utils/character';
import { useCharacter } from '../../hooks/useCharacter';
import { useRuntimeStatus } from '../../hooks/useRuntimeStatus';
import { useAgentTransition } from '../../hooks/useAgentTransition';
import { useAvatarEvents } from '../../hooks/useAvatarEvents';
import { useAuth } from '../../hooks/useAuth';

import { GenerateAvatarResponseEvent } from '../../types/commEvents';

import ClientStatus from '../../components/agent/ClientStatus';
import AgentStatus from '../../components/agent/AgentStatus';
import Button from '../../components/common/Button';
import StartAgentButton from '../../components/agent/buttons/StartAgentButton';
import StopAgentButton from '../../components/agent/buttons/StopAgentButton';
import MasonryPostsLayout from '../../components/agent/MasonryPosts';

import wuaiLogoBlack from '../../assets/images/wuai-logo.svg';
import ActionToolsBlock from '../../components/common/ActionToolsBlock';
import GenericTextArea from '../../components/inputs/GenericTextArea';
import { useToasts } from '../../hooks/useToasts';
import Modal from '../../components/common/Modal';
import useModal from '../../hooks/useModal';
import useAgent from '../../hooks/useAgent';

import { TbClockCheck, TbClockPlay, TbClockBolt } from "react-icons/tb";
import Tabs from '../../components/common/Tabs';

const CharacterDetailPage: React.FC = () => {
  let navigate = useNavigate();
  const { addNotification } = useToasts();
  const { id } = useParams<{ id: string }>();
  const { character, loading: characterLoading, error: characterError } = useCharacter(id!);
  const { userProfile } = useAuth();
  const avatarModal = useModal();

  const { updateAvatarHandler } = useAgent();
  
  // Use hooks for status
  const { statusData, isRunning } = useRuntimeStatus(id!, 5000);
  const [totalUptime, setTotalUptime] = useState<number>(0);
  const [currentUptime, setCurrentUptime] = useState<number>(0);
  
  // Use hooks for transitions
  const { startAgent, stopAgent, loading: transitionLoading } = useAgentTransition();
  const [shouldLoadBoot, setShouldLoadBoot] = useState<boolean>(false);
  const [shouldLoadStop, setShouldLoadStop] = useState<boolean>(false);

  const [avatarPromt, setAvatarPromt] = useState<string>();
  const [agentAvatar, setAgentAvatar] = useState<string>();

  // Use avatar events hook
  const { 
    latestImageUrl: avatarFromGeneration, 
    isGenerating: isGeneratingAvatar,
    generateAvatar,
  } = useAvatarEvents({
    agentId: id,
    pollingInterval: 5000,
    onFinalEvent: (event: GenerateAvatarResponseEvent) => handleSaveFinalAvatarUrl(event.agentId, event.prompt, event.image_url)
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

  useEffect(() => {
    if (character?.face_image_path) {
      setAgentAvatar(`${import.meta.env.VITE_AVATAR_BUCKET_BASE_URL}/${character.face_image_path}`)
    }
  }, [character]);

  useEffect(() => {
    if (avatarFromGeneration) {
      setAgentAvatar(avatarFromGeneration)
    }
  }, [avatarFromGeneration]);

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

  const handleSaveFinalAvatarUrl = async (agentId: string, promt: string, url: string) => {
    try {
      await updateAvatarHandler(
        agentId, 
        url,
        promt,
        {
          onSuccess: async () => {
            addNotification('Updated', 'success');
          },
          onError: (error) => {
            if ('errors' in error) {
              // Format validation errors
              const messages = Object.entries(error.errors)
                .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                .join('; ');
              addNotification(`Error updating agent: ${messages}`, 'error');
            } else {
              addNotification(`Error updating agent: ${error.message}`, 'error');
            }
          }
        }
      );
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
    avatarModal.close();
  }

  if (characterLoading) return <p>Loading character...</p>;
  if (characterError) return <p>Error: {characterError}</p>;

  const tabSetup = [
    { 
      id: 'tab1', 
      label: 'Personality', 
      content:
        <div className='flex sm:flex-row flex-col gap-4 w-full mb-12'>
          {/* biography card*/}
          <div className="flex flex-col bg-white rounded-lg sm:w-1/3 w-full">
            <div className='p-4'>
              <h5 className="mb-6 text-black text-xl font-semibold font-anek-latin">
                Biographical statements about the character
              </h5>
              <ul className="ml-6 list-disc font-light">
                {character?.definition.bio.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>

          {/* lore card*/}
          <div className="flex flex-col bg-white rounded-lg sm:w-1/3 w-full">
            <div className='p-4'>
              <h5 className="mb-6 text-black text-xl font-semibold font-anek-latin">
                Backstory and unique character traits
              </h5>
              <ul className="ml-6 list-disc font-light">
                {character?.definition.lore.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>

          {/* topics */}
          <div className="flex flex-col bg-white rounded-lg sm:w-1/3 w-full">
            <div className='p-4'>
              <h5 className="mb-6 text-black text-xl font-semibold font-anek-latin">
                Topics of interests
              </h5>
              <div className="text-slate-600 font-light flex flex-wrap gap-2">
                {character?.definition.topics.map((row: string, index: number) => (
                  <span className='capitalize px-3 text-sm py-1 bg-blue-400 font-anek-latin text-black rounded-full' key={index}>{row}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
    },
    { 
      id: 'tab2', 
      label: 'Style', 
      content:
        <div className='flex sm:flex-row flex-col gap-4 w-full mb-12'>
          {/* all style */}
          <div className="flex flex-col bg-white rounded-lg sm:w-1/3 w-full">
            <div className='p-4'>
              <h5 className="mb-2 text-black text-xl font-semibold font-anek-latin">
                General style instructions for all interactions
              </h5>
              <ul className="ml-6 list-disc font-light">
                {character?.definition.style.all.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>

          {/* chat style */}
          <div className="flex flex-col bg-white rounded-lg sm:w-1/3 w-full">
            <div className='p-4'>
              <h5 className="mb-2 text-black text-xl font-semibold font-anek-latin">
                Specific instructions for chat interactions
              </h5>
              <ul className="ml-6 list-disc font-light">
                {character?.definition.style.chat.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>

          {/* post style */}
          <div className="flex flex-col bg-white rounded-lg sm:w-1/3 w-full">
            <div className='p-4'>
              <h5 className="mb-2 text-black text-xl font-semibold font-anek-latin">
                Specific instructions for social media posts
              </h5>
              <ul className="ml-6 list-disc font-light">
                {character?.definition.style.post.map((row: string, index: number) => (
                  <li className='capitalize' key={index}>{row}.</li>
                ))}
              </ul>
            </div>
          </div>
        </div> 
    },
    { 
      id: 'tab3', 
      label: 'Examples', 
      content: 
        <div className='flex sm:flex-row flex-col gap-4 w-full mb-12'>
          {/* chat */}
          <div className="relative bg-white p-4 rounded-lg sm:w-[440px] w-full">
            {/* Heading */}
            <div className="flex flex-col space-y-1.5 mb-4">
              <h5 className="text-black text-xl font-semibold font-anek-latin">
                Chat example
              </h5>
            </div>
            {/* Chat Container */}
            <div className="h-[550px] rounded-lg bg-yellow-100" style={{overflowY: 'scroll'}}>
              <div className="h-[200px] p-4" style={{minWidth: '100%', display: 'table'}}>
              {character?.definition.messageExamples.map((conversation: MessageExample[], index: number) => (
                <div key={index}>
                {conversation.map((message: MessageExample, messageIndex: number) => (
                  message.user === "{{user1}}" || message.user === "You" ? (
                    //  User Chat Message
                    <div key={messageIndex} className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
                      <span className="flex flex-col rounded-full w-9 h-9">
                        <div className="rounded-full bg-yellow-100 border border-yellow-100 p-1">
                          <svg stroke="none" fill="black" strokeWidth="0" viewBox="0 0 16 16" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z">
                            </path>
                          </svg>
                        </div>
                      </span>
                      <div className="leading-relaxed">
                        <span className="block font-bold text-gray-700">You</span>
                        <div className='bg-beige-200 p-8 rounded-b-[35px] rounded-tr-[35px]'>
                          {message.content.text}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Chat Message AI
                    <div key={messageIndex} className="flex flex-row-reverse gap-3 my-4 text-gray-600 text-sm">
                      {/* avatar */}
                        {!agentAvatar ? (
                          <img src={wuaiLogoBlack} className="h-[20px] w-[20px]" alt="wuai logo"/>
                        ) : (
                          <div 
                            className={`h-[20px] w-[20px] rounded rounded-lg flex !bg-cover cursor-pointer hover:opacity-60 ease-in-out duration-300 `}
                            style={{background: `url(${agentAvatar}`}} 
                            onClick={() => avatarModal.open()} 
                          />
                        )}
                      <div key={messageIndex} className="leading-relaxed">
                        <span className="block font-bold text-gray-700 text-right capitalize">{character?.definition.name}</span>
                        <div className='bg-beige-200 p-8 rounded-b-[35px] rounded-tl-[35px]'>
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
            {/* Input box
            <div className="z-[9000] bottom-0 w-full h-[50px] bg-white flex items-center p-4">
              <form className="flex items-center justify-center w-full space-x-2">
                <input disabled className="disabled:opacity-75 flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2" placeholder="Type your message" value=""/>
                <button disabled className="disabled:opacity-50 inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-2">
                  Send
                </button>
              </form>
            </div>
            */}
          </div>
          {/* social media examples */}
          <div className="bg-white p-4 rounded-lg w-full">
            {/* Heading */}
            <div className="flex flex-col space-y-1.5 mb-2 mb-4">
              <h5 className="text-black text-xl font-semibold font-anek-latin">
                Post examples
              </h5>
            </div>
            <MasonryPostsLayout scroll={true} scrollSize={600} columns={3} posts={character?.definition.postExamples ?? []} username={character?.definition.name || 'WuAI'}></MasonryPostsLayout>
          </div>
        </div> 
    }
  ];

  return (
    <>
      <div className='flex md:flex-row flex-col gap-4 mb-4'>
        {/* summary */}
        <div className='flex flex-col gap-4 sm:w-9/12 p-4 w-full flex-grow bg-white rounded-lg'>
          {/* block header */}
          <div className='flex flex-row items-center'>
            <div className='flex flex-col w-3/4'>
              <h2 className='font-bold text-2xl font-anek-latin'>
                Basic information
              </h2>
              <p className='text-lg'>
                Overview of your agent's channels
              </p>
            </div>

            {/* status */}
            <div className='flex flex-col w-1/4 w-full h-full sm:items-end items-start justify-start mt-2'>
              <AgentStatus id={character?.id!} withLoader={true}/>
            </div>
          </div>

          {/* block body */}
          <div className='sm:grid sm:grid-cols-2 flex flex-col sm:items-center gap-4 bg-beige-200 rounded-lg w-full flex-grow p-4'>
            <div className='flex flex-row gap-4 items-center'>
              {/* avatar */}
              {!agentAvatar ? (
                <div className='h-[62px] w-[70px] rounded rounded-full p-2 border hover:opacity-60 items-center justify-center flex transform border-4 border-orange-500 transition-transform duration-300 object-cover'>
                  <i className='fa fa-user fa-2x text-orange-500'></i>
                </div>
              ) : (
                <div 
                  className={`h-[82px] w-[82px] rounded rounded-lg flex !bg-cover cursor-pointer hover:opacity-60 ease-in-out duration-300 `}
                  style={{background: `url(${agentAvatar}`}} 
                  onClick={() => avatarModal.open()} 
                />
              )}
              {/* basic info */}
              <div className='flex sm:flex-row flex-col-reverse w-full h-full'>
                {/* info */}
                  <div className='flex flex-col w-full justify-center'>
                    {/* name */}
                    <p className='font-semibold text-xl font-anek-latin'>{character?.definition.name}</p>
                    {/* llm-model */}
                    <p className=''>
                      <i>{character?.llm_provider_settings.llm_provider_model}</i>
                    </p>
                  </div>
              </div>
            </div>

            {/* timestamps and counters */}
            <div className='flex flex-col sm:flex-row justify-between h-full sm:items-center gap-4'>
              {/* created at */}
              <div className='flex flex-col'>
                <div className='flex flex-row items-center gap-1'>
                  <TbClockCheck size={18}/>
                  <span className='text-sm text-black font-anek-latin font-bold'>Created at</span>
                </div>
                <span className='font-semibold'>{formatDateFromString(character?.created_at!)}</span>
              </div>
                
              {/* total uptime*/}
              <div className='flex flex-col'>
                <div className='flex flex-row items-center gap-1'>
                  <TbClockPlay size={18}/>
                  <span className='text-sm text-black font-anek-latin font-bold'>Total uptime</span>
                </div>
                <span className='font-semibold'>{formatSeconds(totalUptime)}</span>
              </div>
                  
              {/* current uptime*/}
              <div className='flex flex-col'>
                <div className='flex flex-row items-center gap-1'>
                  <TbClockBolt size={18}/>
                  <span className='text-sm text-black font-anek-latin font-bold'>Current uptime</span>
                </div>
                <span className='font-semibold'>{formatSeconds(currentUptime)}</span>
              </div>
            </div>
          </div>

          {/* desktop controls */}
          <div className='hidden sm:flex flex-row my-4 justify-start gap-4'>
            <StartAgentButton 
              onClick={() => setShouldLoadBoot(true)} 
              isRunning={isRunning} 
              loading={shouldLoadBoot || transitionLoading || statusData?.status === "unknown"} 
              className='!rounded-lg shadow-none'
            />
            <StopAgentButton 
              onClick={() => setShouldLoadStop(true)} 
              isRunning={isRunning} 
              loading={shouldLoadStop || transitionLoading || statusData?.status === "unknown"} 
              className='!rounded-lg shadow-none'
            />
            <Button 
              onClick={() => navigate(`/agent/character/${character?.id}`)} 
              icon='fa-pencil' 
              label={`Edit Agent settings`}
              disabled={shouldLoadBoot || shouldLoadStop || statusData?.status === "unknown"}
              className='!rounded-lg shadow-none'
            />
            <Button 
              onClick={() => avatarModal.open()} 
              icon={isGeneratingAvatar ? 'fa fa-spin fa-gear' : 'fa fa-image'}
              label={isGeneratingAvatar ? 'Generating avatar...' : 'Generate avatar'}
              disabled={isGeneratingAvatar}
              className='!rounded-lg shadow-none hover:[background-image:none]'
            />
          </div>
        </div>

        {/* clients */}
        <div className='flex flex-col gap-4 sm:w-4/12 p-4 bg-white rounded-lg'>
          <div>
            <h2 className='font-bold text-2xl font-anek-latin'>
              Channels
            </h2>
            <p className='text-lg'>
                Overview of your agent's channels
            </p>
          </div>

          <ClientStatus character={character} />
        </div>
      </div>

      {/* tabs */}
      <div className='flex flex-col gap-4 rounded-lg'>
        <Tabs tabs={tabSetup} />
      </div>

      {/* navigation */}
      <ActionToolsBlock className='md:hidden'>
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
          label={`Edit Agent settings`}
          disabled={shouldLoadBoot || shouldLoadStop || statusData?.status === "unknown"}
        />
        <Button 
          onClick={() => avatarModal.open()} 
          icon={isGeneratingAvatar ? 'fa fa-spin fa-gear' : 'fa fa-image'}
          label={isGeneratingAvatar ? 'Generating avatar...' : 'Generate avatar'}
          disabled={isGeneratingAvatar}
          className='bg-gradient-primary hover:[background-image:none]'
        />
      </ActionToolsBlock>

      {/* avatar modal */}
      <Modal
        ref={avatarModal.modalRef}
        title="Add face to your Agent"
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
                disabled={isGeneratingAvatar}
                className='!px-6'
              />
            </div>
          </div>
        }
      >
        {!agentAvatar && isGeneratingAvatar ? (
          <div className='justify-center flex flex-row'>
            {isGeneratingAvatar ? (
              <div className={`h-[250px] w-full flex justify-center items-center gap-2 border rounded-md`}>
                <i className='fa fa-gear fa-spin'/>
                <span>Your request is in queue...</span>
              </div>
            ) : (
              <div className='p-4 border rounded-md w-full flex justify-center'>
                <img src={wuaiLogoBlack} className={`h-[250px] w-[250px] opacity-10 self-center`} alt="wuai logo"/>
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
                
                downloadImage(agentAvatar!);
              }}
              icon="fa fa-download"
            />
            <div 
              className={`h-[250px] w-[250px] flex !bg-cover cursor-pointer group-hover:opacity-60 ease-in-out duration-300`}
              style={{background: `url(${agentAvatar}`}} 
            />
          </div>
        )}
        <GenericTextArea
          placeholder="Write an example user message..."
          className="user-message"
          value={avatarPromt ?? (character?.face_image_generation_prompt || undefined)}
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