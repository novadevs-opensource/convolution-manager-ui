// src/types/commEvents.ts

// Constants for event types
export const EVENT_TYPES = {
  // Runtime actions
  BOOT: 'boot',
  STOP: 'stop',
  UPDATE: 'update',
  BOOT_ACK: 'bootACK',
  STOP_ACK: 'stopACK',
  UPDATE_ACK: 'updateACK',
  
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
  | typeof EVENT_TYPES.BOOT_ACK 
  | typeof EVENT_TYPES.STOP_ACK 
  | typeof EVENT_TYPES.UPDATE_ACK
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

// ACK error codes
export type AckErrorCode = 1000 | 1001 | 1002 | 1003 | 1004 | 1005 | 1006 | 1007 | 1008 | 1009 | 1010 | 1011 | 2000;

export const ackErrorCodeMessages: Record<AckErrorCode, string> = {
  1000: "Unknown error from AWS",
  1001: "Unknown error",
  1002: "Invalid fields in the event",
  1003: "Agent is still being removed",
  1004: "Cannot create metadata file in Amazon S3",
  1005: "Cannot create the agent",
  1006: "Cannot send ACK due to an Amazon SQS error",
  1007: "Cannot delete the agent",
  1008: "Cannot restart the agent",
  1009: "The agent does not exist",
  1010: "The agent repeatedly failed to start",
  1011: "Cannot get metadata file",
  2000: "Agent removed successfully"
};

// ACK events
export interface BaseAckEvent extends BaseEvent {
  action: typeof EVENT_TYPES.BOOT_ACK | typeof EVENT_TYPES.STOP_ACK | typeof EVENT_TYPES.UPDATE_ACK;
  success: string;
  errorCode?: AckErrorCode;
}

export interface BootAgentAckEvent extends BaseAckEvent {
  action: typeof EVENT_TYPES.BOOT_ACK;
}

export interface StopAgentAckEvent extends BaseAckEvent {
  action: typeof EVENT_TYPES.STOP_ACK;
}

export interface UpdateAgentAckEvent extends BaseAckEvent {
  action: typeof EVENT_TYPES.UPDATE_ACK;
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
  | BootAgentAckEvent 
  | StopAgentAckEvent 
  | UpdateAgentAckEvent

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
    !('success' in event); // Exclude ACK events
};

export const isAckEvent = (event: AgentEvent): event is BootAgentAckEvent | StopAgentAckEvent | UpdateAgentAckEvent => {
  return event && 'action' in event && 
    [EVENT_TYPES.BOOT_ACK, EVENT_TYPES.STOP_ACK, EVENT_TYPES.UPDATE_ACK].includes((event as any).action) && 
    'success' in event;
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