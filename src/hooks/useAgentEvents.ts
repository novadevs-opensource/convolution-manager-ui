// src/hooks/useAgentEvents.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToasts } from './useToasts';
import { 
  AgentEvent, 
  BootAgentAckEvent, 
  StopAgentAckEvent, 
  UpdateAgentAckEvent,
  GenerateAvatarResponseEvent,
  isAvatarResponseEvent,
  isAvatarFinalEvent,
  ackErrorCodeMessages,
  generateEventKey,
  EVENT_TYPES
} from '../types/commEvents';
import { listenForEvents } from '../services/messageHandler';
import { useAuth } from './useAuth';
import { useRuntimeStatus } from './useRuntimeStatus';
import api from '../services/apiClient';

interface UseAgentEventsProps {
  agentId?: string;
  pollingInterval?: number;
  autoRefreshStatus?: boolean;
}

interface TransitionResponse {
  message: string;
}

/**
 * Hook to listen for and process agent events
 */
export function useAgentEvents({
  agentId,
  pollingInterval = 5000,
  autoRefreshStatus = true
}: UseAgentEventsProps = {}) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const { addNotification } = useToasts();
  const { userProfile } = useAuth();
  
  // Use ref for runtime status refetch to avoid dependencies changing
  const runtimeStatusRef = useRef<() => void>(() => {});
  
  // Track the processed events to avoid duplicates
  const processedEventsRef = useRef<Set<string>>(new Set());
  
  // Only get the refetch function once on mount
  const { refetch } = useRuntimeStatus(agentId || '');
  useEffect(() => {
    runtimeStatusRef.current = refetch;
  }, [refetch]);
  
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

  const revertAgentStatus = useCallback((action: string, ackEvent: BootAgentAckEvent | StopAgentAckEvent | UpdateAgentAckEvent) => {
    addNotification(`Failed to ${action} agent`, 'error');
    updateAgentStatus(ackEvent.agentId, "stopped")
    .then(_updateSuccess => {
      addNotification(`Agent status successfully reverted`, "success");
    })
    .catch(() => {
      addNotification(`Something went wrong reverting the agent state`, "error");
    });
  }, [addNotification, updateAgentStatus]);
  
  // Process a single event
  const processEvent = useCallback((event: AgentEvent) => {
    // Generate a unique event ID 
    const eventId = generateEventKey(event);
    
    // Check if we've already processed this event
    if (processedEventsRef.current.has(eventId)) {
      console.log(`Skipping duplicate event: ${eventId}`);
      return;
    }
    
    // Mark this event as processed
    processedEventsRef.current.add(eventId);
    
    // Add to events list (use functional update to avoid dependencies)
    setEvents(prevEvents => {
      // Still check for duplicates in the state as a safety measure
      if (prevEvents.some(e => generateEventKey(e) === eventId)) {
        return prevEvents;
      }
      
      return [...prevEvents, event];
    });

    // If there is an agentId filter and this event doesn't match, ignore it
    if (agentId && 'agentId' in event && event.agentId !== agentId) {
      return;
    }

    // Process ACK events (boot, stop, update)
    if ('action' in event && [
      EVENT_TYPES.BOOT_ACK, EVENT_TYPES.STOP_ACK, EVENT_TYPES.UPDATE_ACK
    ].includes(event.action)) {
      const ackEvent = event as (BootAgentAckEvent | StopAgentAckEvent | UpdateAgentAckEvent);
      const success = ackEvent.success === 'true';
      
      switch (ackEvent.action) {
        case EVENT_TYPES.BOOT_ACK:
          if (success) {
            updateAgentStatus(ackEvent.agentId, "running").then(_updateSuccess => {
              addNotification(`Agent started successfully`, "success");
            });
          } else {
            console.error(ackEvent.errorCode ? ackErrorCodeMessages[ackEvent.errorCode] : 'Unknown error', ackEvent);
            revertAgentStatus("start", ackEvent);
          }
          break;
          
        case EVENT_TYPES.STOP_ACK:
          if (success) {
            updateAgentStatus(ackEvent.agentId, "stopped").then(_updateSuccess => {
              addNotification(`Agent stopped successfully`, "success");
            });
          } else {
            console.error(ackEvent.errorCode ? ackErrorCodeMessages[ackEvent.errorCode] : 'Unknown error', ackEvent);
            revertAgentStatus("stop", ackEvent);
          }
          break;
          
        case EVENT_TYPES.UPDATE_ACK:
          if (success) {
            updateAgentStatus(ackEvent.agentId, 'running').then(_updateSuccess => {
              addNotification(`Agent updated successfully`, "success");
            });
          } else {
            console.error(ackEvent.errorCode ? ackErrorCodeMessages[ackEvent.errorCode] : 'Unknown error', ackEvent);
            revertAgentStatus("update", ackEvent);
          }
          break;
      }
      
      // Refresh status if auto-refresh is enabled
      if (autoRefreshStatus && runtimeStatusRef.current) {
        runtimeStatusRef.current();
      }
    }
    
    // Process avatar events
    if (isAvatarResponseEvent(event)) {
      const avatarEvent = event as GenerateAvatarResponseEvent;
      
      // If it's a final event, we can stop listening for events and notify the user
      if (isAvatarFinalEvent(avatarEvent)) {
        addNotification(`Avatar generation completed`, "success");
      }
    }
  }, [agentId, addNotification, autoRefreshStatus, revertAgentStatus, updateAgentStatus]);

  // Poll for events
  const pollForEvents = useCallback(async () => {
    if (!userProfile?.id) return;
    if (isPolling) return; // Prevent multiple concurrent polling calls
    
    setIsPolling(true);
    
    try {
      const events = await listenForEvents(userProfile.id, agentId);
      
      if (events && events.length > 0) {
        // Process each event
        events.forEach(processEvent);
      }
    } catch (err) {
      console.error('Error polling for events:', err);
    } finally {
      setIsPolling(false);
    }
  }, [userProfile?.id, agentId, isPolling, processEvent]);

  // Setup polling
  useEffect(() => {
    // Don't continue if no user ID
    if (!userProfile?.id) return;
    
    // Initial poll
    pollForEvents();
    
    // Setup interval for polling
    const intervalId = setInterval(() => {
      pollForEvents();
    }, pollingInterval);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      // Clear processed events when the hook is unmounted or dependencies change
      processedEventsRef.current.clear();
    };
  }, [userProfile?.id, agentId, pollingInterval, pollForEvents]);

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
        .find(event => 'agentId' in event && event.agentId === targetAgentId);
    },
    // Clear events for the specified agent
    clearEvents: (specificAgentId?: string) => {
      const targetAgentId = specificAgentId || agentId;
      if (!targetAgentId) {
        setEvents([]);
        processedEventsRef.current.clear();
      } else {
        setEvents(prevEvents => 
          prevEvents.filter(event => !('agentId' in event) || event.agentId !== targetAgentId)
        );
        
        // Also remove processed events for this agent
        const newProcessedEvents = new Set<string>();
        processedEventsRef.current.forEach(eventId => {
          if (!eventId.includes(targetAgentId)) {
            newProcessedEvents.add(eventId);
          }
        });
        processedEventsRef.current = newProcessedEvents;
      }
    }
  };
}