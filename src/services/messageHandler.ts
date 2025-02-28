// src/services/messageHandler.ts
import { AgentRuntimeAction, AgentEvent } from "../types/commEvents";
import { deleteMessageFromQueue, receiveMessagesFromQueue, sendMessageToQueue } from "./aws/sqsService";

/**
 * Send an event to the queue
 */
export const enqueueEvent = async (
  eventMessage: AgentEvent, 
  action: AgentRuntimeAction,
  userId: string, 
  agentId: string, 
): Promise<void> => {
  const messageId = await sendMessageToQueue(eventMessage, action, userId, agentId);
  if (messageId) {
    console.log(`Message enqueued with ID: ${messageId}`, eventMessage);
  } else {
    console.log("There was an issue enqueuing the message.");
  }
};

/**
 * Listen for ACK events from the queue
 * Returns processed messages so they can be handled by the UI
 */
export const listenForEvents = async (loggedInUserId: string): Promise<any[] | null> => {
  const messages = await receiveMessagesFromQueue(loggedInUserId);
  
  if (messages && messages.length > 0) {
    console.log(`Received ${messages.length} ACK messages for user ${loggedInUserId}`);
    
    // Process each message
    for (const message of messages) {
      try {
        // Log message information
        console.log(`Processing ACK message:`, message.Body);
        
        // Delete the message from the queue after processing
        await deleteMessageFromQueue(message.ReceiptHandle!);
        console.log("ACK message processed and deleted from queue.");
      } catch (err) {
        console.error("Error processing ACK message:", err);
      }
    }
    
    return messages;  // Return the messages for further processing
  } else {
    // No messages to process - this is normal, don't log to avoid console spam
    return null;
  }
};