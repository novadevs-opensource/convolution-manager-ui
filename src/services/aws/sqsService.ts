// src/services/aws/sqsService.ts
import { SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { createSQSClient } from "./sqsClient";
import { AgentRuntimeAction, AgentEvent } from "../../types/commEvents";

const sqsClient = createSQSClient();
const queueUrl = `${import.meta.env.VITE_EVENTS_QUEUE_ENDPOINT}${import.meta.env.VITE_EVENTS_QUEUE_PATH}`;

/**
 * Send a message to the SQS queue
 */
export const sendMessageToQueue = async (
  message: AgentEvent, 
  action: AgentRuntimeAction,
  userId: string, 
  agentId: string, 
): Promise<string | null> => {
  try {
    const { MessageId } = await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
        MessageAttributes: {
          'userId': {
            DataType: 'String',
            StringValue: userId,
          },
          'agentId': {
            DataType: 'String',
            StringValue: agentId,
          },
          'runtimeAction': {
            DataType: 'String',
            StringValue: action,
          },
        },
      })
    );
    return MessageId!;

  } catch (error) {
    console.error("Error sending the message:", error);
    return null;
  }
};

/**
 * Receive messages from the SQS queue, focusing on ACK messages
 */
export const receiveMessagesFromQueue = async (loggedInUserId: string): Promise<any[] | null> => {
  try {
    const { Messages } = await sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 5, // Shorter wait time to be more responsive
        MessageAttributeNames: ['All'], // Get all message attributes
      })
    );

    // Filter the messages to only include ACK messages for this user
    const filteredMessages = (Messages || []).filter((message) => {
      // Check message attributes
      const userId = message.MessageAttributes?.userId?.StringValue;
      const runtimeAction = message.MessageAttributes?.runtimeAction?.StringValue;
      
      // If attributes don't exist but the message body is valid, try to parse it
      if (!userId || !runtimeAction) {
        try {
          const body = JSON.parse(message.Body || '{}');
          // Check if it's an ACK message for this user
          return (
            (body.userId === loggedInUserId || body.userID === loggedInUserId) && // Support both userId and userID
            (body.action === 'bootACK' || body.action === 'stopACK' || body.action === 'updateACK')
          );
        } catch (e) {
          return false;
        }
      }
      
      // Check if it's an ACK message for this user based on attributes
      return (
        userId === loggedInUserId && // Only returns messages whose 'userId' matches
        (runtimeAction === 'bootACK' || runtimeAction === 'stopACK' || runtimeAction === 'updateACK')
      );
    });

    return filteredMessages;
  } catch (error) {
    console.error("Error receiving messages:", error);
    return null;
  }
};

/**
 * Delete a processed message from the queue
 */
export const deleteMessageFromQueue = async (receiptHandle: string): Promise<void> => {
  try {
    await sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      })
    );
  } catch (error) {
    console.error("Error deleting the message:", error);
  }
};
