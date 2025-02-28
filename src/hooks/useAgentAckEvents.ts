// src/hooks/useAgentAckEvents.ts
import { useState, useEffect, useCallback, useRef } from 'react';
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
import api from '../services/apiClient';

interface UseAgentAckEventsProps {
  agentId?: string;
  pollingInterval?: number;
  autoRefreshStatus?: boolean;
}

interface TransitionResponse {
  message: string;
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
  
  // Use ref for runtime status refetch to avoid dependencies changing
  const runtimeStatusRef = useRef<() => void>(() => {});
  
  // Only get the refetch function once on mount
  const { refetch } = useRuntimeStatus(agentId || '');
  useEffect(() => {
    runtimeStatusRef.current = refetch;
  }, [refetch]);

  // Create a ref to track processed event IDs to avoid processing the same event twice
  const processedEventIds = useRef<Set<string>>(new Set());
  
  /**
   * Update agent status in the database
   */
  const updateAgentStatus = useCallback(async (id: string, status: 'running' | 'stopped'): Promise<boolean> => {
    try {
      const response = await api.post<TransitionResponse>(
        `/runtime/${id}/update`, 
        { status }
      );
      return response.status === 200;
    } catch (err: any) {
      console.error(`Error setting status to ${status}:`, err);
      return false;
    }
  }, []);
  
  // Process a single event
  const processEvent = useCallback((event: AgentEvent) => {
    // Generate a unique ID for this event to avoid processing duplicates
    const eventId = `${event.action}-${event.agentId}-${event.userId}`;
    
    // Skip if we've already processed this event
    if (processedEventIds.current.has(eventId)) {
      return;
    }
    
    // Mark this event as processed
    processedEventIds.current.add(eventId);
    
    // Add to events list (use functional update to avoid dependencies)
    setEvents(prevEvents => {
      // Check if we already have this event to avoid duplicates
      if (prevEvents.some(e => 
        e.action === event.action && 
        e.agentId === event.agentId && 
        e.userId === event.userId
      )) {
        return prevEvents;
      }
      return [...prevEvents, event];
    });

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
      
      // Process the ACK event based on its type
      switch (ackEvent.action) {
        case 'bootACK': {
          if (success) {
            // Update status to running in the database if successful
            updateAgentStatus(ackEvent.agentId, 'running').then(updateSuccess => {
              addNotification(
                updateSuccess 
                  ? `Agent started successfully` 
                  : `Something went wrong booting your agent`,
                updateSuccess ? 'success' : 'error'
              );
              
              // Refresh status if auto-refresh is enabled
              if (autoRefreshStatus) {
                runtimeStatusRef.current();
              }
            });
          } else {
            addNotification(`Failed to start agent`, 'error');
            
            // Even if failed, we should refresh to get current status
            if (autoRefreshStatus) {
              runtimeStatusRef.current();
            }
          }
          break;
        }
          
        case 'stopACK': {
          if (success) {
            // Update status to stopped in the database if successful
            updateAgentStatus(ackEvent.agentId, 'stopped').then(updateSuccess => {
              addNotification(
                updateSuccess 
                  ? `Agent stopped successfully` 
                  : `Something went wrong stopping your agent`,
                updateSuccess ? 'success' : 'error'
              );
              
              // Refresh status if auto-refresh is enabled
              if (autoRefreshStatus) {
                runtimeStatusRef.current();
              }
            });
          } else {
            addNotification(`Failed to stop agent`, 'error');
            
            // Even if failed, we should refresh to get current status
            if (autoRefreshStatus) {
              runtimeStatusRef.current();
            }
          }
          break;
        }
          
        case 'updateACK': {
          if (success) {
            // Update status to running in the database if successful
            updateAgentStatus(ackEvent.agentId, 'running').then(updateSuccess => {
              addNotification(
                updateSuccess 
                  ? `Agent updated successfully` 
                  : `Something went wrong updating your agent`,
                updateSuccess ? 'success' : 'error'
              );
              
              // Refresh status if auto-refresh is enabled
              if (autoRefreshStatus) {
                runtimeStatusRef.current();
              }
            });
            
            // Refresh status if auto-refresh is enabled
            if (autoRefreshStatus) {
              runtimeStatusRef.current();
            }
          } else {
            addNotification(`Failed to update agent`, 'error');
            
            // Even if failed, we should refresh to get current status
            if (autoRefreshStatus) {
              runtimeStatusRef.current();
            }
          }
          break;
        }
      }
    }
  }, [addNotification, autoRefreshStatus, updateAgentStatus]);

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

  // Setup polling - use refs for dependencies to prevent effect from running too often
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
  }, [userProfile?.id, pollingInterval, pollForEvents]); // Added pollForEvents as dependency

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