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
            updateAgentStatus(ackEvent.agentId, "running").then(_updateSuccess => {
              addNotification(`Agent started successfully`, "success");
            });
          } else {
            // TODO: Add AWS error code
            revertAgentStatus("start", ackEvent);
          }
          break;
        }
          
        case 'stopACK': {
          if (success) {
            // Update status to stopped in the database if successful
            updateAgentStatus(ackEvent.agentId, "stopped").then(_updateSuccess => {
              addNotification(`Agent stopped successfully`, "success");
            });
          } else {
            // TODO: Add AWS error code
            revertAgentStatus("stop", ackEvent);
          }
          break;
        }
          
        case 'updateACK': {
          if (success) {
            // Update status to running in the database if successful
            updateAgentStatus(ackEvent.agentId, 'running').then(_updateSuccess => {
              addNotification(`Agent updated successfully`, "success");
            });
          } else {
            // TODO: Add AWS error code
            revertAgentStatus("update", ackEvent);
          }
          break;
        }
      }
      // Refresh status if auto-refresh is enabled
      if (autoRefreshStatus && runtimeStatusRef.current) {
        runtimeStatusRef.current();
      }
    }
  }, [agentId, addNotification, autoRefreshStatus, revertAgentStatus, updateAgentStatus]);

  // Poll for events
  const pollForEvents = useCallback(async () => {
    if (!userProfile?.id) return;
    if (isPolling) return; // Prevent multiple concurrent polling calls
    
    setIsPolling(true);
    console.log(`Polling for events at ${new Date().toISOString()}`); // Safer way to log date
    
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
    } finally {
      setIsPolling(false);
    }
  }, [userProfile?.id, isPolling, processEvent]);

  // Setup polling
  useEffect(() => {
    // Don't continue if no user ID
    if (!userProfile?.id) return;
    
    // Clear any existing interval if the agentId has changed
    let intervalId: NodeJS.Timeout;
    
    const startPolling = () => {
      // Do initial poll
      pollForEvents();
      
      // Setup interval for polling
      intervalId = setInterval(() => {
        pollForEvents();
      }, pollingInterval);
    };
    
    // Start polling immediately
    startPolling();
    
    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userProfile?.id, agentId, pollingInterval, pollForEvents]); // Include important dependencies

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