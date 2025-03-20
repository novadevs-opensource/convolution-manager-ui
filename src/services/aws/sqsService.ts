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
  generateEventKey,
  normalizeEvent,
  EVENT_TYPES
} from "../../types/commEvents";


// Constants for queue attributes
const MESSAGE_ATTRIBUTES = {
  USER_ID: 'userId',
  AGENT_ID: 'agentId',
  ACTION: 'action'
};

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
 * @param action Optional action type for events
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
    // Ensure the message has a timestamp
    if (!message.timestamp) {
      message.timestamp = Date.now();
    }
    
    // Prepare message attributes
    const messageAttributes: any = {
      [MESSAGE_ATTRIBUTES.USER_ID]: {
        DataType: 'String',
        StringValue: userId,
      },
      [MESSAGE_ATTRIBUTES.AGENT_ID]: {
        DataType: 'String',
        StringValue: agentId,
      },
    };
    
    // Add action attribute if provided
    if (action) {
      messageAttributes[MESSAGE_ATTRIBUTES.ACTION] = {
        DataType: 'String',
        StringValue: action,
      };
    }
    
    // Debug log
    console.debug(`Sending to ${queueType} queue:`, {
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
    
    console.info(`Message sent to ${queueType} queue with ID: ${MessageId}`);
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
  // Ensure the action is set correctly
  const updatedMessage = {
    ...message,
    action: EVENT_TYPES.AVATAR_REQUEST
  };
  
  return sendMessage(updatedMessage, QueueType.AVATAR, userId, agentId, EVENT_TYPES.AVATAR_REQUEST);
};

/**
 * Interface for message filtering options
 */
interface MessageFilterOptions {
  userId: string;
  agentId?: string;
  actions?: string[];
}

/**
 * Helper function to extract filter criteria from a message
 * @param message The message to extract criteria from
 * @param filterOptions The filter options to match against
 * @returns True if the message matches the filter criteria
 */
const messageMatchesFilter = (message: any, filterOptions: MessageFilterOptions): boolean => {
  try {
    // First try using message attributes
    const userId = message.MessageAttributes?.[MESSAGE_ATTRIBUTES.USER_ID]?.StringValue;
    const agentId = message.MessageAttributes?.[MESSAGE_ATTRIBUTES.AGENT_ID]?.StringValue;
    const action = message.MessageAttributes?.[MESSAGE_ATTRIBUTES.ACTION]?.StringValue;
    
    // If we have message attributes, use those for filtering
    if (userId) {
      // User ID must match
      if (userId !== filterOptions.userId) return false;
      
      // Agent ID must match if specified
      if (filterOptions.agentId && agentId !== filterOptions.agentId) return false;
      
      // Action must match one of the specified actions if provided
      if (filterOptions.actions && action && !filterOptions.actions.includes(action)) return false;
      
      // If we got here, the message matches the criteria
      return true;
    }
    
    // If we don't have message attributes, parse the body
    if (!message.Body) return false;
    
    const body = JSON.parse(message.Body);
    
    // Check user ID
    if (body.userId !== filterOptions.userId) return false;
    
    // Check agent ID if specified
    if (filterOptions.agentId && body.agentId !== filterOptions.agentId) return false;
    
    // Check action if specified
    if (filterOptions.actions) {
      const eventAction = body.action;
      
      if (!eventAction || !filterOptions.actions.includes(eventAction)) return false;
    }
    
    // If we got here, the message matches the criteria
    return true;
  } catch (error) {
    console.error('Error filtering message:', error);
    return false;
  }
};

/**
 * Receive messages from a specified queue with filtering
 * @param queueType The type of queue to receive from
 * @param filterOptions Options for filtering messages
 * @returns Filtered messages if successful, null otherwise
 */
export const receiveMessages = async (
  queueType: QueueType,
  filterOptions: MessageFilterOptions
): Promise<any[] | null> => {
  const { client, url } = getQueueConfig(queueType);
  
  try {
    console.debug(`Receiving from ${queueType} queue at ${new Date().toISOString()}`);
    
    const { Messages } = await client.send(
      new ReceiveMessageCommand({
        QueueUrl: url,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 5,
        MessageAttributeNames: ['All'],
        VisibilityTimeout: 30, // 30 seconds
      })
    );
    
    if (!Messages || Messages.length === 0) {
      return [];
    }
    
    console.debug(`Received ${Messages.length} raw messages from ${queueType} queue`);
    
    // Filter messages based on the provided options
    const filteredMessages = Messages.filter(message => 
      messageMatchesFilter(message, filterOptions)
    );
    
    console.debug(`Filtered to ${filteredMessages.length} messages from ${queueType} queue`);
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
    actions: [EVENT_TYPES.BOOT_ACK, EVENT_TYPES.STOP_ACK, EVENT_TYPES.UPDATE_ACK]
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
    actions: [EVENT_TYPES.AVATAR_PROGRESS, EVENT_TYPES.AVATAR_FINAL]
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
    console.debug(`Deleting message from ${queueType} queue with receipt: ${receiptHandle.substring(0, 20)}...`);
    
    await client.send(
      new DeleteMessageCommand({
        QueueUrl: url,
        ReceiptHandle: receiptHandle,
      })
    );
    
    console.debug(`Successfully deleted message from ${queueType} queue`);
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
    
    // Parse and normalize the event
    const parsedEvent = normalizeEvent(JSON.parse(message.Body));
    
    // Add the SQS message ID for additional uniqueness
    if (message.MessageId) {
      parsedEvent.messageId = message.MessageId;
    }
    
    // Debug: Log the event type
    if ('action' in parsedEvent) {
      console.debug(`Parsed ${parsedEvent.action} event from message ${message.MessageId}`);
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
 * @param expectedEventTypes Optional array of expected event types for validation
 * @returns Array of extracted events
 */
export const processMessages = async (
  messages: any[],
  queueType: QueueType,
  expectedEventTypes?: string[]
): Promise<AgentEvent[]> => {
  if (!messages || messages.length === 0) {
    return [];
  }
  
  console.debug(`Processing ${messages.length} messages from ${queueType} queue`);
  
  const events: AgentEvent[] = [];
  const processedEvents = new Set<string>(); // Track processed events to prevent duplicates
  
  for (const message of messages) {
    try {
      const event = parseMessageToEvent(message);
      
      if (!event) {
        // Delete invalid messages
        if (message.ReceiptHandle) {
          await deleteMessage(queueType, message.ReceiptHandle);
        }
        continue;
      }
      
      // Validate event type if expected types are provided
      if (expectedEventTypes && 'action' in event) {
        const isValidType = expectedEventTypes.includes(event.action);
        
        if (!isValidType) {
          console.warn(`Found unexpected event type ${event.action} in ${queueType} queue, will delete:`, event);
          if (message.ReceiptHandle) {
            await deleteMessage(queueType, message.ReceiptHandle);
          }
          continue;
        }
      }
      
      // Generate a unique key for this event
      const eventKey = generateEventKey(event, message.MessageId);
      
      // Only process if we haven't seen this event before
      if (!processedEvents.has(eventKey)) {
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
        console.debug(`Skipping duplicate event: ${eventKey}`);
        // Still delete duplicate messages
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
  
  console.debug(`Processed ${events.length} valid events from ${queueType} queue`);
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
  
  // Process the messages with expected avatar event types
  const allEvents = await processMessages(
    messages, 
    QueueType.AVATAR,
    [EVENT_TYPES.AVATAR_PROGRESS, EVENT_TYPES.AVATAR_FINAL]
  );
  
  // Filter for avatar response events
  const avatarEvents = allEvents
    .filter(isAvatarResponseEvent) as GenerateAvatarResponseEvent[];
  
  // Debug log about final events
  const finalEvents = avatarEvents.filter(e => e.action === EVENT_TYPES.AVATAR_FINAL);
  if (finalEvents.length > 0) {
    console.debug(`Found ${finalEvents.length} final avatar events`);
  }
  
  return avatarEvents;
};
