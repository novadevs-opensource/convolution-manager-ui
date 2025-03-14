// src/types/commEvents.ts

// Base event interface
export interface BaseEvent {
    userId: string;
    agentId: string;
  }
  
  // Runtime actions
  export type AgentRuntimeAction = 
    | 'boot' | 'stop' | 'update' 
    | 'bootACK' | 'stopACK' | 'updateACK'
    | 'generateAvatar' | 'generateAvatarProgress' | 'generateAvatarFinal';
  
  // Agent runtime events
  export interface BootAgentEvent extends BaseEvent {
    action: 'boot';
    executionId: string;
  }
  
  export interface StopAgentEvent extends BaseEvent {
    action: 'stop';
    executionId: string;
  }
  
  export interface UpdateAgentEvent extends BaseEvent {
    action: 'update';
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
    action: 'bootACK' | 'stopACK' | 'updateACK';
    success: string;
    errorCode?: AckErrorCode;
  }
  
  export interface BootAgentAckEvent extends BaseAckEvent {
    action: 'bootACK';
  }
  
  export interface StopAgentAckEvent extends BaseAckEvent {
    action: 'stopACK';
  }
  
  export interface UpdateAgentAckEvent extends BaseAckEvent {
    action: 'updateACK';
  }
  
  // Avatar generation events
  export interface GenerateAvatarRequestEvent extends BaseEvent {
    event_type: 'generate_avatar_request';
    prompt: string;
  }
  
  export interface GenerateAvatarResponseEvent extends BaseEvent {
    event_type: 'progress' | 'final';
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
  
  // Improved type guards with safer checking
  export const isRuntimeEvent = (event: AgentEvent): event is BootAgentEvent | StopAgentEvent | UpdateAgentEvent => {
    return event && 'action' in event && 
      ['boot', 'stop', 'update'].includes((event as any).action) && 
      !('success' in event); // Exclude ACK events
  };
  
  export const isAckEvent = (event: AgentEvent): event is BootAgentAckEvent | StopAgentAckEvent | UpdateAgentAckEvent => {
    return event && 'action' in event && 
      ['bootACK', 'stopACK', 'updateACK'].includes((event as any).action) && 
      'success' in event;
  };
  
  export const isAvatarEvent = (event: AgentEvent): event is GenerateAvatarRequestEvent | GenerateAvatarResponseEvent => {
    return event && 'event_type' in event;
  };
  
  export const isAvatarRequestEvent = (event: AgentEvent): event is GenerateAvatarRequestEvent => {
    return isAvatarEvent(event) && (event as any).event_type === 'generate_avatar_request';
  };
  
  export const isAvatarResponseEvent = (event: AgentEvent): event is GenerateAvatarResponseEvent => {
    return isAvatarEvent(event) && 
      ['progress', 'final'].includes((event as GenerateAvatarResponseEvent).event_type) && 
      'image_url' in event;
  };
  
  export const isAvatarFinalEvent = (event: AgentEvent): event is GenerateAvatarResponseEvent => {
    return isAvatarResponseEvent(event) && (event as GenerateAvatarResponseEvent).event_type === 'final';
  };