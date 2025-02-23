// src/aws/sqsClient.ts
import { SQSClient } from "@aws-sdk/client-sqs";

// Configuración del cliente de SQS
export const createSQSClient = () => {
  return new SQSClient({
    region: import.meta.env.VITE_EVENTS_QUEUE_REGION,
    endpoint: import.meta.env.VITE_EVENTS_QUEUE_ENDPOINT,
    credentials: {
      accessKeyId: import.meta.env.VITE_EVENTS_QUEUE_CREDENTIALS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_EVENTS_QUEUE_CREDENTIALS_ACCESS_KEY,
    },
  });
};
