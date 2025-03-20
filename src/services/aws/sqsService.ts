// src/services/aws/sqsService.ts
import { 
  SendMessageCommand, 
  ReceiveMessageCommand, 
  DeleteMessageCommand 
} from "@aws-sdk/client-sqs";
import { 
  getEventClient, 
  getAckClient, 
  getAvatarClient 
} from "./sqsClient";
import { 
  AgentRuntimeAction, 
  AgentEvent, 
  GenerateAvatarRequestEvent,
  GenerateAvatarResponseEvent,
  isAvatarResponseEvent,
  isAvatarEvent,
  isAckEvent
} from "../../types/commEvents";

// SQS clients
const eventClient = getEventClient();
const ackClient = getAckClient();
const avatarClient = getAvatarClient();

// Queue URLs
const eventQueueUrl = `${import.meta.env.VITE_EVENTS_QUEUE_ENDPOINT}${import.meta.env.VITE_EVENTS_QUEUE_PATH}`;
const ackQueueUrl = `${import.meta.env.VITE_ACK_EVENTS_QUEUE_ENDPOINT}${import.meta.env.VITE_ACK_EVENTS_QUEUE_PATH}`;
const avatarQueueUrl = `${import.meta.env.VITE_AVATAR_GENERATION_QUEUE_ENDPOINT}${import.meta.env.VITE_AVATAR_GENERATION_QUEUE_PATH}`;

/**
 * Enum for different message queue types
 */
export enum QueueType {
  EVENT = 'event',
  ACK = 'ack',
  AVATAR = 'avatar'
}

/**
 * Get the appropriate client and URL for the specified queue type
 */
const getQueueConfig = (queueType: QueueType) => {
  switch (queueType) {
    case QueueType.EVENT:
      return { client: eventClient, url: eventQueueUrl };
    case QueueType.ACK:
      return { client: ackClient, url: ackQueueUrl };
    case QueueType.AVATAR:
      return { client: avatarClient, url: avatarQueueUrl };
    default:
      throw new Error(`Unknown queue type: ${queueType}`);
  }
};

/**
 * Send a message to a specified SQS queue
 * @param message The message payload to send
 * @param queueType The type of queue to send to
 * @param userId User ID for message filtering
 * @param agentId Agent ID for message filtering
 * @param action Optional action type for runtime events
 * @returns Message ID if successful, null otherwise
 */
export const sendMessage = async (
  message: any,
  queueType: QueueType,
  userId: string,
  agentId: string,
  action?: AgentRuntimeAction
): Promise<string | null> => {
  const { client, url } = getQueueConfig(queueType);
  
  try {
    // Prepare message attributes
    const messageAttributes: any = {
      'userId': {
        DataType: 'String',
        StringValue: userId,
      },
      'agentId': {
        DataType: 'String',
        StringValue: agentId,
      },
    };
    
    // Add action attribute if provided
    if (action) {
      messageAttributes['runtimeAction'] = {
        DataType: 'String',
        StringValue: action,
      };
    }
    
    // Debug log
    console.log(`Sending to ${queueType} queue:`, {
      url,
      message: JSON.stringify(message).substring(0, 100) + '...',
      attributes: messageAttributes
    });
    
    const { MessageId } = await client.send(
      new SendMessageCommand({
        QueueUrl: url,
        MessageBody: JSON.stringify(message),
        MessageAttributes: messageAttributes,
      })
    );
    
    console.log(`Message sent to ${queueType} queue with ID: ${MessageId}`);
    return MessageId || null;
  } catch (error) {
    console.error(`Error sending message to ${queueType} queue:`, error);
    return null;
  }
};

/**
 * Send a runtime event to the event queue
 */
export const sendRuntimeEvent = async (
  message: AgentEvent,
  action: AgentRuntimeAction,
  userId: string,
  agentId: string
): Promise<string | null> => {
  return sendMessage(message, QueueType.EVENT, userId, agentId, action);
};

/**
 * Send an avatar generation request
 */
export const sendAvatarGenerationRequest = async (
  message: GenerateAvatarRequestEvent,
  userId: string,
  agentId: string
): Promise<string | null> => {
  return sendMessage(message, QueueType.AVATAR, userId, agentId);
};

/**
 * Interface for message filtering options
 */
interface MessageFilterOptions {
  userId: string;
  agentId?: string;
  actions?: string[];
  eventTypes?: string[];
}

/**
 * Receive messages from a specified queue with filtering
 * @param queueType The type of queue to receive from
 * @param filterOptions Options for filtering messages
 * @returns Filtered messages if successful, null otherwise. TODO: Review if generate_avatar_request are being self consumed.
 */
export const receiveMessages = async (
  queueType: QueueType,
  filterOptions: MessageFilterOptions
): Promise<any[] | null> => {
  const { client, url } = getQueueConfig(queueType);
  
  try {
    console.log(`Receiving from ${queueType} queue at ${new Date().getUTCSeconds()}`);
    
    const { Messages } = await client.send(
      new ReceiveMessageCommand({
        QueueUrl: url,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 5,
        MessageAttributeNames: ['All'],
        // Set a short visibility timeout to prevent duplicate processing
        VisibilityTimeout: 30, // 30 seconds
      })
    );
    
    if (!Messages || Messages.length === 0) {
      return [];
    }
    
    console.log(`Received ${Messages.length} raw messages from ${queueType} queue`);
    
    // Filter messages based on the provided options
    const filteredMessages = Messages.filter(message => {
      // Try to get user and agent IDs from message attributes
      const userId = message.MessageAttributes?.userId?.StringValue;
      const agentId = message.MessageAttributes?.agentId?.StringValue;
      const action = message.MessageAttributes?.runtimeAction?.StringValue;
      
      // If necessary attributes don't exist, try to parse the message body
      if (!userId) {
        try {
          const body = JSON.parse(message.Body || '{}');
          
          // Debug: Log the body to see what we're getting
          console.log(`Message body from ${queueType} queue:`, {
            messageId: message.MessageId,
            body: JSON.stringify(body).substring(0, 200) + '...',
          });
          
          // Check if user ID matches
          const userIdMatch = body.userId === filterOptions.userId;
          if (!userIdMatch) return false;
          
          // Check if agent ID matches (if specified)
          if (filterOptions.agentId && body.agentId !== filterOptions.agentId) {
            return false;
          }
          
          // For ACK messages, check if action matches
          if (filterOptions.actions && body.action) {
            return filterOptions.actions.includes(body.action);
          }
          
          // For avatar messages, check if event_type matches
          if (filterOptions.eventTypes && body.event_type) {
            return filterOptions.eventTypes.includes(body.event_type);
          }
          
          // If we got here, the message matches the filter criteria
          return true;
        } catch (e) {
          console.error(`Error parsing message body from ${queueType} queue:`, e);
          return false;
        }
      }
      
      // Filter based on message attributes
      if (userId !== filterOptions.userId) return false;
      
      if (filterOptions.agentId && agentId !== filterOptions.agentId) {
        return false;
      }

      // Filter by event type
      if (message.Body && filterOptions.eventTypes) {
        let parsedBody = JSON.parse(message.Body)
        return filterOptions.eventTypes?.includes(parsedBody.event_type);
      }
      
      if (filterOptions.actions && action) {
        return filterOptions.actions.includes(action);
      }
      
      return true;
    });
    
    console.log(`Filtered to ${filteredMessages.length} messages from ${queueType} queue`);
    return filteredMessages;
  } catch (error) {
    console.error(`Error receiving messages from ${queueType} queue:`, error);
    return null;
  }
};

/**
 * Receive ACK events for a specific user
 */
export const receiveAckEvents = async (
  userId: string,
  agentId?: string
): Promise<any[] | null> => {
  return receiveMessages(QueueType.ACK, {
    userId,
    agentId,
    actions: ['bootACK', 'stopACK', 'updateACK']
  });
};

/**
 * Receive avatar generation events for a specific user and agent
 */
export const receiveAvatarEvents = async (
  userId: string,
  agentId: string
): Promise<any[] | null> => {
  return receiveMessages(QueueType.AVATAR, {
    userId,
    agentId,
    eventTypes: ['progress', 'final']
  });
};

/**
 * Delete a message from a specified queue
 * @param queueType The type of queue to delete from
 * @param receiptHandle The receipt handle of the message to delete
 */
export const deleteMessage = async (
  queueType: QueueType,
  receiptHandle: string
): Promise<boolean> => {
  const { client, url } = getQueueConfig(queueType);
  
  try {
    console.log(`Deleting message from ${queueType} queue with receipt: ${receiptHandle.substring(0, 20)}...`);
    
    await client.send(
      new DeleteMessageCommand({
        QueueUrl: url,
        ReceiptHandle: receiptHandle,
      })
    );
    
    console.log(`Successfully deleted message from ${queueType} queue`);
    return true;
  } catch (error) {
    console.error(`Error deleting message from ${queueType} queue:`, error);
    return false;
  }
};

/**
 * Parse a received message into an agent event
 */
export const parseMessageToEvent = (message: any): AgentEvent | null => {
  try {
    if (!message || !message.Body) {
      return null;
    }
    
    const parsedEvent = JSON.parse(message.Body) as AgentEvent;
    
    // Debug: Log the event type
    if ('action' in parsedEvent) {
      console.log(`Parsed ${parsedEvent.action} event from message ${message.MessageId}`);
    } else if ('event_type' in parsedEvent) {
      console.log(`Parsed ${parsedEvent.event_type} event from message ${message.MessageId}`);
    }
    
    return parsedEvent;
  } catch (error) {
    console.error('Error parsing message to event:', error);
    return null;
  }
};

/**
 * Process received messages, extracting events and deleting processed messages
 * @param messages The messages to process
 * @param queueType The type of queue the messages came from
 * @returns Array of extracted events
 */
export const processMessages = async (
  messages: any[],
  queueType: QueueType
): Promise<AgentEvent[]> => {
  if (!messages || messages.length === 0) {
    return [];
  }
  
  console.log(`Processing ${messages.length} messages from ${queueType} queue`);
  
  const events: AgentEvent[] = [];
  const processedEvents = new Set<string>(); // Track processed events to prevent duplicates
  
  for (const message of messages) {
    try {
      const event = parseMessageToEvent(message);
      
      if (event) {
        // Additional validation based on queue type
        if (queueType === QueueType.ACK && !isAckEvent(event)) {
          console.warn(`Found non-ACK event in ACK queue, will delete but not process:`, event);
          if (message.ReceiptHandle) {
            //await deleteMessage(queueType, message.ReceiptHandle);
          }
          continue;
        }
        
        if (queueType === QueueType.AVATAR && !isAvatarEvent(event)) {
          console.warn(`Found non-avatar event in AVATAR queue, will delete but not process:`, event);
          if (message.ReceiptHandle) {
            //await deleteMessage(queueType, message.ReceiptHandle);
          }
          continue;
        }
        
        // Create a unique key for this event to prevent duplicates
        let eventKey = '';
        
        if ('action' in event) {
          eventKey = `${event.action}-${event.agentId}-${event.userId}`;
        } else if ('event_type' in event) {
          eventKey = `${event.event_type}-${event.agentId}-${event.userId}-${(event as any).image_url || ''}`;
        }
        
        // Only process if we haven't seen this event before
        if (eventKey && !processedEvents.has(eventKey)) {
          processedEvents.add(eventKey);
          events.push(event);
          
          // Delete the message after processing
          if (message.ReceiptHandle) {
            const deleted = await deleteMessage(queueType, message.ReceiptHandle);
            if (!deleted) {
              console.warn(`Failed to delete message, may be processed again: ${eventKey}`);
            }
          }
        } else {
          console.log(`Skipping duplicate event: ${eventKey}`);
          // Still delete duplicate messages
          if (message.ReceiptHandle) {
            await deleteMessage(queueType, message.ReceiptHandle);
          }
        }
      } else {
        // Delete invalid messages
        if (message.ReceiptHandle) {
          await deleteMessage(queueType, message.ReceiptHandle);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      // Try to delete the message even if there was an error
      if (message.ReceiptHandle) {
        await deleteMessage(queueType, message.ReceiptHandle);
      }
    }
  }
  
  console.log(`Processed ${events.length} valid events from ${queueType} queue`);
  return events;
};

/**
 * Process received messages into avatar response events
 * @param messages The messages to process
 * @returns Array of avatar response events
 */
export const processAvatarMessages = async (
  messages: any[]
): Promise<GenerateAvatarResponseEvent[]> => {
  if (!messages || messages.length === 0) {
    return [];
  }
  
  // Process the messages using the common function first
  const allEvents = await processMessages(messages, QueueType.AVATAR);
  
  // Filter for avatar response events
  const avatarEvents = allEvents
    .filter(isAvatarResponseEvent) as GenerateAvatarResponseEvent[];
  
  // Debug log about final events
  const finalEvents = avatarEvents.filter(e => e.event_type === 'final');
  if (finalEvents.length > 0) {
    console.log(`Found ${finalEvents.length} final avatar events`);
  }
  
  return avatarEvents;
};

/**
 * Get a message receipt ID for debugging
 */
export const getMessageId = (message: any): string => {
  if (!message) return 'unknown';
  return message.MessageId || message.ReceiptHandle?.substring(0, 10) || 'unknown';
};