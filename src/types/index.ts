// src/types/index.ts
export interface CharacterData {
  name: string;
  clients: Client[];
  modelProvider: string;
  settings: {
    secrets: {
      // Open Router
      OPENROUTER_MODEL?: string,
      // Those threee vars are needed because elizaos/core seems to be buggy
      SMALL_OPENROUTER_MODEL?: string,
      MEDIUM_OPENROUTER_MODEL?: string,
      LARGE_OPENROUTER_MODEL?: string,
      OPENROUTER_API_KEY?: string,
      // Telegram
      TELEGRAM_BOT_TOKEN?: string,
      // X
      TWITTER_USERNAME?: string,
      TWITTER_PASSWORD?: string,
      TWITTER_EMAIL?: string,
    };
    voice: {
      model: string;
    };
  };
  plugins: unknown[];
  bio: string[];
  lore: string[];
  knowledge: string[];
  messageExamples: MessageExample[][];
  postExamples: string[];
  topics: string[];
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
  adjectives: string[];
  people: string[];
}

// Represents pagination info returned by the API
export interface Pagination {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: [{
    url: string|null,
    label: string,
    active: boolean,
  }];
  next_page_url: string | null;
  per_page: number,
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Represents the agent (character) object
export interface Agent {
  id: string;
  definition: CharacterData; // This is the parsed version of 'definition' from the API
  auto_generation_prompt?: string;
  auto_enhancement_prompt?: string;
  llm_provider_settings: LlmProviderSettings;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: RuntimeStatus;
  last_boot_execution: string | null;
  last_stop_execution: string | null;
  uptime_total_seconds: number;
}

export type RuntimeStatus = 'running' | 'stopped' | 'unknown' | null;

// Represents the LLM provider settings
export interface LlmProviderSettings {
  id: string;
  llm_provider_name: string;
  llm_provider_model: string;
  llm_provider_api_key: string;
  created_at: string;
  updated_at: string;
}

export type Client = 'discord' | 'direct' | 'twitter' | 'telegram' | 'farcaster';

// Response for fetching a list of characters (with pagination)
export interface CharactersResponse {
  data: Agent[];
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: [{
    url: string|null,
    label: string,
    active: boolean,
  }];
  next_page_url: string | null;
  per_page: number,
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Response for fetching a single character
export interface CharacterResponse {
  character: Agent;
}

export interface MessageExample {
  user: string;
  content: {
    text: string;
  };
}

// Backup
export interface Backup {
  name: string;
  timestamp: string;
  data: CharacterData;
}

export interface BackupListItem {
  name: string;
  timestamp: string;
  key: string;
}

// Files
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProcessFilesResponse {
  knowledge: string[];
}

export interface FixJsonResponse {
  character: CharacterData;
}
// Events
export interface FileUploadEvent extends Event {
  detail: {
    files: File[];
  };
}

export interface KnowledgeUpdateEvent extends Event {
  detail: {
    knowledge: string[];
  };
}
// Openrouter
export interface OpenRouterModel {
  id: string
  name: string
  created: number
  description: string
  context_length: number
  architecture: Architecture
  pricing: Pricing
  top_provider: TopProvider
  per_request_limits: any
}

export interface Architecture {
  modality: string
  tokenizer: string
  instruct_type: string
}

export interface Pricing {
  prompt: string
  completion: string
  image: string
  request: string
}

export interface TopProvider {
  context_length: number
  max_completion_tokens: any
  is_moderated: boolean
}

// Declarar los eventos personalizados
declare global {
  interface HTMLElementEventMap {
    'fileUpload': FileUploadEvent;
    'knowledgeUpdate': KnowledgeUpdateEvent;
  }
}