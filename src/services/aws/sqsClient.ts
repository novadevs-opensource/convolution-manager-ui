// src/services/aws/sqsClient.ts
import { SQSClient } from "@aws-sdk/client-sqs";

/**
 * Create an SQS client with the specified configuration
 * @param options Configuration options for the SQS client
 * @returns Configured SQS client instance
 */
export const createSQSClient = (options: {
  region: string;
  endpoint: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}) => {
  return new SQSClient({
    region: options.region,
    endpoint: options.endpoint,
    credentials: options.credentials,
  });
};

// Predefined clients for different event types
export const getEventClient = () => {
  return createSQSClient({
    region: import.meta.env.VITE_EVENTS_QUEUE_REGION,
    endpoint: import.meta.env.VITE_EVENTS_QUEUE_ENDPOINT,
    credentials: {
      accessKeyId: import.meta.env.VITE_EVENTS_QUEUE_CREDENTIALS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_EVENTS_QUEUE_CREDENTIALS_ACCESS_KEY,
    },
  });
};

export const getAckClient = () => {
  return createSQSClient({
    region: import.meta.env.VITE_ACK_EVENTS_QUEUE_REGION,
    endpoint: import.meta.env.VITE_ACK_EVENTS_QUEUE_ENDPOINT,
    credentials: {
      accessKeyId: import.meta.env.VITE_ACK_EVENTS_QUEUE_CREDENTIALS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_ACK_EVENTS_QUEUE_CREDENTIALS_ACCESS_KEY,
    },
  });
};

export const getAvatarClient = () => {
  return createSQSClient({
    region: import.meta.env.VITE_AVATAR_GENERATION_QUEUE_REGION,
    endpoint: import.meta.env.VITE_AVATAR_GENERATION_QUEUE_ENDPOINT,
    credentials: {
      accessKeyId: import.meta.env.VITE_AVATAR_GENERATION_QUEUE_CREDENTIALS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AVATAR_GENERATION_QUEUE_CREDENTIALS_ACCESS_KEY,
    },
  });
};