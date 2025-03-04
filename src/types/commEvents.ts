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
}

export interface StopAgentAckEvent {
    action: AgentRuntimeAction,
    agentId: string,
    userId: string,
    success: string,
}

export interface UpdateAgentAckEvent {
    action: AgentRuntimeAction,
    agentId: string,
    userId: string,
    success: string,
}

export type AgentRuntimeAction = 'boot' | 'stop' | 'update' | 'bootACK' | 'stopACK' | 'updateACK';

// Union type for all event types
export type AgentEvent = 
    | BootAgentEvent 
    | StopAgentEvent 
    | UpdateAgentEvent 
    | BootAgentAckEvent 
    | StopAgentAckEvent 
    | UpdateAgentAckEvent;