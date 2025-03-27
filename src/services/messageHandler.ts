// src/services/messageHandler.ts
import { 
  AgentRuntimeAction, 
  AgentEvent, 
  GenerateAvatarRequestEvent,
  GenerateAvatarResponseEvent,
  EVENT_TYPES
} from "../types/commEvents";
import { 
  sendRuntimeEvent, 
  sendAvatarGenerationRequest,
  receiveAvatarEvents,
  QueueType,
  processMessages
} from "./aws/sqsService";

/**
 * Send an agent runtime event to the queue
 */
export const enqueueEvent = async (
  eventMessage: AgentEvent, 
  action: AgentRuntimeAction,
  userId: string, 
  agentId: string
): Promise<string | null> => {
  // Add timestamp if not present
  const enhancedMessage = {
    ...eventMessage,
    timestamp: eventMessage.timestamp || Date.now()
  };
  
  const messageId = await sendRuntimeEvent(enhancedMessage, action, userId, agentId);
  
  if (messageId) {
    console.debug(`Runtime event enqueued with ID: ${messageId}`, enhancedMessage);
    return messageId;
  } else {
    console.error("Failed to enqueue runtime event");
    return null;
  }
};

/**
 * Send an avatar generation request to the queue
 */
export const enqueueAvatarRequest = async (
  userId: string,
  agentId: string,
  prompt: string
): Promise<string | null> => {
  const eventMessage: GenerateAvatarRequestEvent = {
    userId,
    agentId,
    timestamp: Date.now(),
    action: EVENT_TYPES.AVATAR_REQUEST,
    prompt
  };
  
  const messageId = await sendAvatarGenerationRequest(eventMessage, userId, agentId);
  
  if (messageId) {
    console.debug(`Avatar generation request enqueued with ID: ${messageId}`, eventMessage);
    return messageId;
  } else {
    console.error("Failed to enqueue avatar generation request");
    return null;
  }
};

/**
 * Listen for avatar generation events from the queue
 * @returns Processed avatar events
 */
export const listenForAvatarEvents = async (userId: string, agentId: string): Promise<GenerateAvatarResponseEvent[]> => {
  const messages = await receiveAvatarEvents(userId, agentId);
  
  if (!messages || messages.length === 0) {
    return [];
  }
  
  console.debug(`Received ${messages.length} avatar events for agent ${agentId}`);
  
  // Process messages and return the avatar events
  const events = await processMessages(
    messages, 
    QueueType.AVATAR,
    [EVENT_TYPES.AVATAR_PROGRESS, EVENT_TYPES.AVATAR_FINAL]
  ) as GenerateAvatarResponseEvent[];
  
  // Debug logging to check what events we're getting back
  events.forEach(event => {
    console.info(`Processed avatar event: type=${event.action}, url=${event.image_url.substring(0, 30)}...`);
    if (event.action === EVENT_TYPES.AVATAR_FINAL) {
      console.info('*** FINAL EVENT DETECTED ***');
    }
  });
  
  return events;
};