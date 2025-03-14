// src/services/messageHandler.ts
import { 
  AgentRuntimeAction, 
  AgentEvent, 
  GenerateAvatarRequestEvent,
  GenerateAvatarResponseEvent,
  isAckEvent
  // Removed unused imports: isAvatarResponseEvent, isAvatarEvent
} from "../types/commEvents";
import { 
  sendRuntimeEvent, 
  sendAvatarGenerationRequest,
  receiveAckEvents, 
  receiveAvatarEvents,
  QueueType,
  processMessages,
  processAvatarMessages
} from "./aws/sqsService";

/**
 * Send an agent runtime event to the queue
 */
export const enqueueEvent = async (
  eventMessage: AgentEvent, 
  action: AgentRuntimeAction,
  userId: string, 
  agentId: string
): Promise<void> => {
  const messageId = await sendRuntimeEvent(eventMessage, action, userId, agentId);
  
  if (messageId) {
    console.log(`Runtime event enqueued with ID: ${messageId}`, eventMessage);
  } else {
    console.error("Failed to enqueue runtime event");
  }
};

/**
 * Send an avatar generation request to the queue
 */
export const enqueueAvatarRequest = async (
  userId: string,
  agentId: string,
  prompt: string
): Promise<void> => {
  const eventMessage: GenerateAvatarRequestEvent = {
    userId,
    agentId,
    event_type: "generate_avatar_request",
    prompt,
  };
  
  const messageId = await sendAvatarGenerationRequest(eventMessage, userId, agentId);
  
  if (messageId) {
    console.log(`Avatar generation request enqueued with ID: ${messageId}`, eventMessage);
  } else {
    console.error("Failed to enqueue avatar generation request");
  }
};

/**
 * Listen for ACK events from the queue
 * @returns Processed agent events
 */
export const listenForEvents = async (userId: string, agentId?: string): Promise<AgentEvent[]> => {
  const messages = await receiveAckEvents(userId, agentId);
  
  console.log(`ack events:`, messages);
  
  if (!messages || messages.length === 0) {
    return [];
  }
  
  console.log(`Received ${messages.length} ACK messages for user ${userId}`);
  
  // Process messages and return the events
  const events = await processMessages(messages, QueueType.ACK);
  
  // Additional validation to make sure we're not mixing event types
  const filteredEvents = events.filter(event => {
    const isAckEventResult = isAckEvent(event);
    if (!isAckEventResult && 'event_type' in event) {
      console.warn('Found avatar event in ACK queue, will ignore:', event);
      return false;
    }
    return isAckEventResult;
  });
  
  return filteredEvents;
};

/**
 * Listen for avatar generation events from the queue
 * @returns Processed avatar events
 */
export const listenForAvatarEvents = async (userId: string, agentId: string): Promise<GenerateAvatarResponseEvent[]> => {
  const messages = await receiveAvatarEvents(userId, agentId);
  
  console.log(`avatar events:`, messages);
  
  if (!messages || messages.length === 0) {
    return [];
  }
  
  console.log(`Received ${messages.length} avatar events for agent ${agentId}`);
  
  // Process messages and return the avatar events
  const events = await processAvatarMessages(messages);
  
  // Debug logging to check what events we're getting back
  events.forEach(event => {
    console.log(`Processed avatar event: type=${event.event_type}, url=${event.image_url.substring(0, 30)}...`);
    if (event.event_type === 'final') {
      console.log('*** FINAL EVENT DETECTED ***');
    }
  });
  
  return events;
};