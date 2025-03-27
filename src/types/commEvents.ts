// src/types/commEvents.ts

// Constants for event types
export const EVENT_TYPES = {
  // Runtime actions
  BOOT: 'boot',
  STOP: 'stop',
  UPDATE: 'update',

  // Avatar actions
  AVATAR_REQUEST: 'generate_avatar_request',
  AVATAR_PROGRESS: 'generate_avatar_progress_response',
  AVATAR_FINAL: 'generate_avatar_final_response'
};

// Base event interface
export interface BaseEvent {
  userId: string;
  agentId: string;
  timestamp?: number; // Timestamp for event ordering
  messageId?: string; // Optional SQS message ID for tracking
}

// Runtime actions unified type
export type AgentRuntimeAction = 
  | typeof EVENT_TYPES.BOOT 
  | typeof EVENT_TYPES.STOP 
  | typeof EVENT_TYPES.UPDATE 
  | typeof EVENT_TYPES.AVATAR_REQUEST
  | typeof EVENT_TYPES.AVATAR_PROGRESS
  | typeof EVENT_TYPES.AVATAR_FINAL;

// Agent runtime events
export interface BootAgentEvent extends BaseEvent {
  action: typeof EVENT_TYPES.BOOT;
  executionId: string;
}

export interface StopAgentEvent extends BaseEvent {
  action: typeof EVENT_TYPES.STOP;
  executionId: string;
}

export interface UpdateAgentEvent extends BaseEvent {
  action: typeof EVENT_TYPES.UPDATE;
  executionId: string;
}

// Avatar generation events (unified with action field)
export interface GenerateAvatarRequestEvent extends BaseEvent {
  action: typeof EVENT_TYPES.AVATAR_REQUEST;
  prompt: string;
}

export interface GenerateAvatarResponseEvent extends BaseEvent {
  action: typeof EVENT_TYPES.AVATAR_PROGRESS | typeof EVENT_TYPES.AVATAR_FINAL;
  image_url: string;
  prompt: string;
}

// Union type for all event types
export type AgentEvent = 
  | BootAgentEvent 
  | StopAgentEvent 
  | UpdateAgentEvent 

  | GenerateAvatarRequestEvent
  | GenerateAvatarResponseEvent;

// Centralized function for generating unique event keys
export const generateEventKey = (event: AgentEvent, sqsMessageId?: string): string => {
  const timestamp = event.timestamp ? `-${event.timestamp}` : '';
  const messageIdPart = event.messageId ? `-${event.messageId}` : (sqsMessageId ? `-${sqsMessageId}` : '');
  
  // Safe extraction of properties
  const action = 'action' in event ? event.action : 'unknown';
  const agentId = 'agentId' in event ? event.agentId : 'unknown';
  const userId = 'userId' in event ? event.userId : 'unknown';
  
  return `${action}-${agentId}-${userId}${messageIdPart}${timestamp}`;
};

// Improved type guards with safer checking
export const isRuntimeEvent = (event: AgentEvent): event is BootAgentEvent | StopAgentEvent | UpdateAgentEvent => {
  return event && 'action' in event && 
    [EVENT_TYPES.BOOT, EVENT_TYPES.STOP, EVENT_TYPES.UPDATE].includes((event as any).action) && 
    !('success' in event);
};

export const isAvatarEvent = (event: AgentEvent): event is GenerateAvatarRequestEvent | GenerateAvatarResponseEvent => {
  return event && 'action' in event && 
    [EVENT_TYPES.AVATAR_REQUEST, EVENT_TYPES.AVATAR_PROGRESS, EVENT_TYPES.AVATAR_FINAL].includes((event as any).action);
};

export const isAvatarRequestEvent = (event: AgentEvent): event is GenerateAvatarRequestEvent => {
  return isAvatarEvent(event) && (event as any).action === EVENT_TYPES.AVATAR_REQUEST;
};

export const isAvatarResponseEvent = (event: AgentEvent): event is GenerateAvatarResponseEvent => {
  return isAvatarEvent(event) && 
    [EVENT_TYPES.AVATAR_PROGRESS, EVENT_TYPES.AVATAR_FINAL].includes((event as any).action) && 
    'image_url' in event;
};

export const isAvatarFinalEvent = (event: AgentEvent): event is GenerateAvatarResponseEvent => {
  return isAvatarResponseEvent(event) && (event as GenerateAvatarResponseEvent).action === EVENT_TYPES.AVATAR_FINAL;
};

// Helper function to ensure events have all required fields
export const normalizeEvent = (event: any): AgentEvent => {
  if (!event) return event;
  
  // Copy the event to avoid modifying the original
  const normalizedEvent = { ...event };
  
  // Add timestamp if not present
  if (!normalizedEvent.timestamp) {
    normalizedEvent.timestamp = Date.now();
  }
  
  return normalizedEvent as AgentEvent;
};