interface ImportMetaEnv {
  VITE_EVENTS_QUEUE_REGION: string,
  VITE_EVENTS_QUEUE_ENDPOINT: string,
  VITE_EVENTS_QUEUE_PATH: string,
  VITE_EVENTS_QUEUE_CREDENTIALS_KEY_ID: string,
  VITE_EVENTS_QUEUE_CREDENTIALS_ACCESS_KEY: string,
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
