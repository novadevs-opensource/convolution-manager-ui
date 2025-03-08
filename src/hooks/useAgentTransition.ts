// src/hooks/useAgentTransition.ts
import { useState } from 'react';
import api from '../services/apiClient';
import { enqueueEvent } from '../services/messageHandler';
import { BootAgentEvent, StopAgentEvent, UpdateAgentEvent } from '../types/commEvents';
import { useToasts } from './useToasts';
import { Agent, RuntimeStatus } from '../types';

// Response interface for transition responses
export interface TransitionResponse {
  message: string;
  data: TransitionResponseData;
}

export interface TransitionResponseData {
  agent: Agent;
}

/**
 * Hook for handling agent state transitions (start, stop, update)
 */
export function useAgentTransition() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useToasts();

  /**
   * Set agent status to 'unknown' in the database
   * @param agentId The ID of the agent
   */
  const setStatusToUnknown = async (agentId: string): Promise<TransitionResponse | false> => {
    try {
      const response = await api.post<TransitionResponse>(
        `/runtime/${agentId}/update`, 
        { status: 'unknown' }
      );
      return response.data;
    } catch (err: any) {
      console.error('Error setting status to unknown:', err);
      return false;
    }
  };

  /**
   * Start an agent
   * @param userId User ID
   * @param agentId Agent ID
   */
  const startAgent = async (userId: string, agentId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Set status to unknown in the database
      const statusUpdated = await setStatusToUnknown(agentId);
      if (!statusUpdated) {
        addNotification('Failed to update agent status', 'error');
        return false;
      }
      
      // 2. Create and enqueue the event
      const eventPayload: BootAgentEvent = {
        action: 'boot',
        agentId,
        userId,
        executionId: statusUpdated.data.agent.execution_id!
      };
      
      enqueueEvent(eventPayload, eventPayload.action, eventPayload.userId, eventPayload.agentId);
      
      addNotification('Agent start command queued successfully', 'success');
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to start agent';
      setError(errorMsg);
      addNotification(errorMsg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Stop an agent
   * @param userId User ID
   * @param agentId Agent ID
   */
  const stopAgent = async (userId: string, agentId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Set status to unknown in the database
      const statusUpdated = await setStatusToUnknown(agentId);
      if (!statusUpdated) {
        addNotification('Failed to update agent status', 'error');
        return false;
      }
      
      // 2. Create and enqueue the event
      const eventPayload: StopAgentEvent = {
        action: 'stop',
        agentId,
        userId,
        executionId: statusUpdated.data.agent.execution_id!
      };
      
      enqueueEvent(eventPayload, eventPayload.action, eventPayload.userId, eventPayload.agentId);
      
      addNotification('Agent stop command queued successfully', 'success');
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to stop agent';
      setError(errorMsg);
      addNotification(errorMsg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an agent after changes
   * @param userId User ID
   * @param agentId Agent ID
   */
  const updateAgent = async (userId: string, agentId: string, runtimeStatus: RuntimeStatus): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Set status to unknown in the database (just if agent is not stopped)
      if (runtimeStatus === "stopped") { // If is a cold update, nothing more to do
        addNotification('Agent update successfully', 'success');
        return true;
      }
      const statusUpdated = await setStatusToUnknown(agentId);
      if (!statusUpdated) {
        addNotification('Failed to update agent status', 'error');
        return false;
      }
      
      // 2. Create and enqueue the event
      const eventPayload: UpdateAgentEvent = {
        action: 'update',
        agentId,
        userId,
        executionId: statusUpdated.data.agent.execution_id!
      };
      
      enqueueEvent(eventPayload, eventPayload.action, eventPayload.userId, eventPayload.agentId);
      
      addNotification('Agent update command queued successfully', 'success');
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update agent';
      setError(errorMsg);
      addNotification(errorMsg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    startAgent,
    stopAgent,
    updateAgent
  };
}