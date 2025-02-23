// src/services/aws/sqsService.ts
import { SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { createSQSClient } from "./sqsClient";
import { AgentRuntimeAction, BootAgentEvent, StopAgentEvent } from "../../types/commEvents";

const sqsClient = createSQSClient();
const queueUrl = `${import.meta.env.VITE_EVENTS_QUEUE_ENDPOINT}${import.meta.env.VITE_EVENTS_QUEUE_PATH}`

// Function to send a message to the queue
export const sendMessageToQueue = async (
  message: BootAgentEvent | StopAgentEvent, 
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

// Function to receive messages from the queue
export const receiveMessagesFromQueue = async (loggedInUserId: string): Promise<any[] | null> => {
  try {
    const { Messages } = await sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
        MessageAttributeNames: ['userId', 'agentId', 'runtimeAction'],
      })
    );

    // Filter the messages by 'userId' and exclude messages with 'runtimeAction' as 'boot' or 'stop'
    const filteredMessages = (Messages || []).filter((message) => {
      const userId = message.MessageAttributes?.userId?.StringValue;
      const runtimeAction = message.MessageAttributes?.runtimeAction?.StringValue;
      return (
        userId === loggedInUserId && // Only returns messages whose 'userId' matches
        runtimeAction !== 'boot' &&   // Exclude 'boot' actions
        runtimeAction !== 'stop'     // Exclude 'stop' actions
      );
    });

    return filteredMessages;
  } catch (error) {
    console.error("Error receiving messages:", error);
    return null;
  }
};


// Function to delete a message from the queue after processing it
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
