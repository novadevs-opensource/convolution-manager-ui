// src/services/messageHandler.ts
import { AgentRuntimeAction, BootAgentEvent, StopAgentEvent } from "../types/commEvents";
import { deleteMessageFromQueue, receiveMessagesFromQueue, sendMessageToQueue } from "./aws/sqsService";

// Send an event to the queue
export const enqueueEvent = async (
  eventMessage: BootAgentEvent | StopAgentEvent, 
  action: AgentRuntimeAction,
  userId: string, 
  agentId: string, 
): Promise<void> => {
  const messageId = await sendMessageToQueue(eventMessage, action, userId, agentId);
  if (messageId) {
    console.log(`Message enqueued with ID: ${messageId}`);
  } else {
    console.log("There was an issue enqueuing the message.");
  }
};

// Listen to messages from the queue and process only the ones belonging to the logged-in user
export const listenForEvents = async (loggedInUserId: string): Promise<any[] | null> => {
  const messages = await receiveMessagesFromQueue(loggedInUserId); // Filter by userId
  if (messages && messages.length > 0) {
    for (const message of messages) {
      console.log(`Received message for user ${loggedInUserId}: ${message.Body}`, message);
      await deleteMessageFromQueue(message.ReceiptHandle!);
      console.log("Message deleted from the queue.");
    }
  } else {
    console.log("No messages to process.");
  }
  return messages;  // Return the received messages
};
