export interface BootAgentEvent {
    action: AgentRuntimeAction,
    agentId: string,
}

export interface StopAgentEvent {
    action: AgentRuntimeAction,
    agentId: string,
}

export interface UpdateAgentEvent {
    action: AgentRuntimeAction,
    agentId: string,
}

export type AgentRuntimeAction = 'boot' | 'stop' | 'update' | 'bootACK' | 'stopACK' | 'updateACK'