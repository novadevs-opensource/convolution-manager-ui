// src/services/messageHandler.ts
import { 
  AgentRuntimeAction, 
  AgentEvent, 
  GenerateAvatarRequestEvent,
  GenerateAvatarResponseEvent,
  isAckEvent,
  EVENT_TYPES
} from "../types/commEvents";
import { 
  sendRuntimeEvent, 
  sendAvatarGenerationRequest,
  receiveAckEvents, 
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
 * Listen for ACK events from the queue
 * @returns Processed agent events
 */
export const listenForEvents = async (userId: string, agentId?: string): Promise<AgentEvent[]> => {
  const messages = await receiveAckEvents(userId, agentId);
  
  if (!messages || messages.length === 0) {
    return [];
  }
  
  console.log(`Received ${messages.length} ACK messages for user ${userId}`);
  
  // Process messages with expected ACK event types
  const events = await processMessages(
    messages, 
    QueueType.ACK,
    [EVENT_TYPES.BOOT_ACK, EVENT_TYPES.STOP_ACK, EVENT_TYPES.UPDATE_ACK]
  );
  
  // Additional validation to ensure we only return ACK events
  const filteredEvents = events.filter(isAckEvent);
  
  return filteredEvents;
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