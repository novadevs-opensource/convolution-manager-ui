// src/hooks/useAgentAckEvents.ts
import { useState, useEffect, useCallback } from 'react';
import { useToasts } from './useToasts';
import { listenForEvents } from '../services/messageHandler';
import { 
  BootAgentAckEvent, 
  StopAgentAckEvent, 
  UpdateAgentAckEvent, 
  AgentEvent 
} from '../types/commEvents';
import { useAuth } from './useAuth';
import { useRuntimeStatus } from './useRuntimeStatus';

interface UseAgentAckEventsProps {
  agentId?: string;
  pollingInterval?: number;
  autoRefreshStatus?: boolean;
}

/**
 * Hook to listen for and process agent ACK events from Lambda
 */
export function useAgentAckEvents({
  agentId,
  pollingInterval = 5000,
  autoRefreshStatus = true
}: UseAgentAckEventsProps = {}) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const { addNotification } = useToasts();
  const { userProfile } = useAuth();
  const { refetch: refreshStatus } = useRuntimeStatus(agentId || '');

  // Process a single event
  const processEvent = useCallback((event: AgentEvent) => {
    // Add to events list
    setEvents(prevEvents => [...prevEvents, event]);

    // If there is an agentId filter and this event doesn't match, ignore it
    if (agentId && event.agentId !== agentId) {
      return;
    }

    // Check if this is an ACK event with a success property
    if ('action' in event && (
      event.action === 'bootACK' || 
      event.action === 'stopACK' || 
      event.action === 'updateACK'
    )) {
      // Safe to cast here since we've checked the action
      const ackEvent = event as (BootAgentAckEvent | StopAgentAckEvent | UpdateAgentAckEvent);
      const success = ackEvent.success === 'true';
      
      // Generate appropriate notification based on event type
      switch (ackEvent.action) {
        case 'bootACK':
          addNotification(
            success 
              ? `Agent started successfully` 
              : `Failed to start agent`,
            success ? 'success' : 'error'
          );
          break;
          
        case 'stopACK':
          addNotification(
            success 
              ? `Agent stopped successfully` 
              : `Failed to stop agent`,
            success ? 'success' : 'error'
          );
          break;
          
        case 'updateACK':
          addNotification(
            success 
              ? `Agent updated successfully` 
              : `Failed to update agent`,
            success ? 'success' : 'error'
          );
          break;
      }
      
      // If we should auto-refresh status, do so
      if (autoRefreshStatus && agentId) {
        refreshStatus();
      }
    }
  }, [agentId, addNotification, autoRefreshStatus, refreshStatus]);

  // Poll for events
  const pollForEvents = useCallback(async () => {
    if (!userProfile?.id) return;
    
    try {
      const messages = await listenForEvents(userProfile.id);
      
      if (messages && messages.length > 0) {
        // Process each message
        messages.forEach(message => {
          try {
            // Parse the event from message body
            const event = JSON.parse(message.Body) as AgentEvent;
            processEvent(event);
          } catch (err) {
            console.error('Error processing event:', err);
          }
        });
      }
    } catch (err) {
      console.error('Error polling for events:', err);
    }
  }, [userProfile?.id, processEvent]);

  // Setup polling
  useEffect(() => {
    if (!userProfile?.id || isPolling) return;
    
    // Set initial polling flag
    setIsPolling(true);
    
    // Do initial poll
    pollForEvents();
    
    // Setup interval for polling
    const intervalId = setInterval(pollForEvents, pollingInterval);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [userProfile?.id, pollForEvents, pollingInterval, isPolling]);

  return {
    events,
    // Method to manually trigger a poll
    checkForEvents: pollForEvents,
    // Get the latest event for the specified agent
    getLatestEvent: (specificAgentId?: string): AgentEvent | undefined => {
      const targetAgentId = specificAgentId || agentId;
      if (!targetAgentId) return undefined;
      
      // Find the latest event for this agent
      return [...events]
        .reverse()
        .find(event => event.agentId === targetAgentId);
    },
    // Clear events for the specified agent
    clearEvents: (specificAgentId?: string) => {
      const targetAgentId = specificAgentId || agentId;
      if (!targetAgentId) {
        setEvents([]);
      } else {
        setEvents(prevEvents => 
          prevEvents.filter(event => event.agentId !== targetAgentId)
        );
      }
    }
  };
}