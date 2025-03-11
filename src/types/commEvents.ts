// src/types/commEvents.ts
export interface BootAgentEvent {
    action: AgentRuntimeAction,
    agentId: string,
    userId: string,
    executionId: string,
}

export interface StopAgentEvent {
    action: AgentRuntimeAction,
    agentId: string,
    userId: string,
    executionId: string,
}

export interface UpdateAgentEvent {
    action: AgentRuntimeAction,
    agentId: string,
    userId: string,
    executionId: string,
}

// New interfaces for ACK events
export interface BootAgentAckEvent {
    action: AgentRuntimeAction,
    agentId: string,
    userId: string,
    success: string,
    errorCode?: AckErrorCode,
}

export interface StopAgentAckEvent {
    action: AgentRuntimeAction,
    agentId: string,
    userId: string,
    success: string,
    errorCode?: AckErrorCode,
}

export interface UpdateAgentAckEvent {
    action: AgentRuntimeAction,
    agentId: string,
    userId: string,
    success: string,
    errorCode?: AckErrorCode,
}

export type AgentRuntimeAction = 'boot' | 'stop' | 'update' | 'bootACK' | 'stopACK' | 'updateACK';
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

// Union type for all event types
export type AgentEvent = 
    | BootAgentEvent 
    | StopAgentEvent 
    | UpdateAgentEvent 
    | BootAgentAckEvent 
    | StopAgentAckEvent 
    | UpdateAgentAckEvent;