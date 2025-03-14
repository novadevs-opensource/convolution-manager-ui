// src/hooks/useAvatarEvents.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToasts } from './useToasts';
import { 
  GenerateAvatarResponseEvent
  // Removed unused import isAvatarFinalEvent
} from '../types/commEvents';
import { listenForAvatarEvents, enqueueAvatarRequest } from '../services/messageHandler';
import { useAuth } from './useAuth';

interface UseAvatarEventsProps {
  agentId?: string;
  pollingInterval?: number;
  onFinalEvent?: (event: GenerateAvatarResponseEvent) => void;
}

/**
 * Hook to handle avatar generation events
 */
export function useAvatarEvents({
  agentId,
  pollingInterval = 5000,
  onFinalEvent
}: UseAvatarEventsProps = {}) {
  const [avatarEvents, setAvatarEvents] = useState<GenerateAvatarResponseEvent[]>([]);
  const [latestImageUrl, setLatestImageUrl] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const { addNotification } = useToasts();
  const { userProfile } = useAuth();
  
  // Store onFinalEvent in a ref to avoid dependencies changing
  const onFinalEventRef = useRef<((event: GenerateAvatarResponseEvent) => void) | undefined>(onFinalEvent);
  
  // Track the processed events to avoid duplicates
  const processedEventsRef = useRef<Set<string>>(new Set());
  
  // Track if a final event has been received
  const finalEventReceivedRef = useRef<boolean>(false);
  
  // Update the ref when onFinalEvent changes
  useEffect(() => {
    onFinalEventRef.current = onFinalEvent;
  }, [onFinalEvent]);
  
  /**
   * Process a single avatar event
   */
  const processEvent = useCallback((event: GenerateAvatarResponseEvent) => {
    // Generate a unique event ID based on its content
    const eventId = `${event.event_type}-${event.agentId}-${event.userId}-${event.image_url}`;
    
    // Debug log
    console.log(`Processing avatar event: ${eventId.substring(0, 50)}...`);
    
    // Check if we've already processed this event
    if (processedEventsRef.current.has(eventId)) {
      console.log(`Skipping duplicate avatar event: ${eventId.substring(0, 50)}...`);
      return;
    }
    
    // Mark this event as processed
    processedEventsRef.current.add(eventId);
    
    // Add to events list (use functional update to avoid dependencies)
    setAvatarEvents(prevEvents => {
      // Still check for duplicates in the state as a safety measure
      if (prevEvents.some(e => 
        e.event_type === event.event_type && 
        e.agentId === event.agentId && 
        e.userId === event.userId &&
        e.image_url === event.image_url
      )) {
        return prevEvents;
      }
      
      return [...prevEvents, event];
    });
    
    // Always update the latest image URL
    setLatestImageUrl(event.image_url);
    
    // If it's a final event, we're done generating
    if (event.event_type === 'final') {
      console.log('*** FINAL AVATAR EVENT DETECTED ***', event);
      
      // Mark that we've received the final event
      finalEventReceivedRef.current = true;
      
      // Update state to indicate we're no longer generating
      setIsGenerating(false);
      
      // Call the onFinalEvent callback if provided
      if (onFinalEventRef.current) {
        onFinalEventRef.current(event);
      }
      
      // Clear the local storage flag
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('is_generating_avatar');
      }
      
      addNotification('Avatar generation completed', 'success');
    }
  }, [addNotification]);
  
  /**
   * Poll for avatar events
   */
  const pollForEvents = useCallback(async () => {
    if (!userProfile?.id || !agentId || isPolling) return;
    
    // Don't poll if we've already received the final event
    if (finalEventReceivedRef.current) {
      console.log('Final event already received, not polling for new events');
      return;
    }
    
    // Don't poll if we're not generating (unless we're doing a manual poll)
    if (!isGenerating && !isPolling) {
      console.log('Not generating and not manually polling, skipping poll');
      return;
    }
    
    setIsPolling(true);
    console.log('Polling for avatar events:', { 
      userId: userProfile.id, 
      agentId, 
      isGenerating 
    });
    
    try {
      const events = await listenForAvatarEvents(userProfile.id, agentId);
      console.log(`Received ${events.length} avatar events`);
      
      if (events && events.length > 0) {
        // Check for final events first
        const finalEvent = events.find(e => e.event_type === 'final');
        if (finalEvent) {
          console.log('Found final event in poll results');
        }
        
        // Process each event
        events.forEach(processEvent);
      }
    } catch (err) {
      console.error('Error polling for avatar events:', err);
    } finally {
      setIsPolling(false);
    }
  }, [userProfile?.id, agentId, isPolling, isGenerating, processEvent]);
  
  /**
   * Start avatar generation with a prompt
   */
  const generateAvatar = useCallback(async (prompt: string) => {
    if (!userProfile?.id || !agentId) {
      addNotification('User or agent information missing', 'error');
      return false;
    }
    
    try {
      // Reset the event tracking
      processedEventsRef.current.clear();
      finalEventReceivedRef.current = false;
      
      await enqueueAvatarRequest(userProfile.id, agentId, prompt);
      
      // Set generating state
      setIsGenerating(true);
      
      // Set localStorage flag
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('is_generating_avatar', agentId);
      }
      
      addNotification('Avatar generation started', 'success');
      return true;
    } catch (error) {
      console.error('Error starting avatar generation:', error);
      addNotification('Failed to start avatar generation', 'error');
      return false;
    }
  }, [userProfile?.id, agentId, addNotification]);
  
  /**
   * Cancel avatar generation
   */
  const cancelGeneration = useCallback(() => {
    setIsGenerating(false);
    finalEventReceivedRef.current = true; // Mark as complete to stop polling
    
    // Clear the local storage flag
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('is_generating_avatar');
    }
    
    addNotification('Avatar generation cancelled', 'error');
  }, [addNotification]);
  
  // Check for saved generation state on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage && agentId) {
      const savedGeneratingAgentId = localStorage.getItem('is_generating_avatar');
      
      if (savedGeneratingAgentId === agentId) {
        console.log('Found saved generation state, resuming generation');
        setIsGenerating(true);
        finalEventReceivedRef.current = false;
      }
    }
    
    // Clear the processed events set when agentId changes
    return () => {
      processedEventsRef.current.clear();
      finalEventReceivedRef.current = false;
    };
  }, [agentId]);
  
  // Setup polling
  useEffect(() => {
    // Don't continue if we're not generating or missing info
    if (!userProfile?.id || !agentId || !isGenerating) {
      return;
    }
    
    console.log('Setting up polling interval for avatar events');
    
    // Initial poll
    pollForEvents();
    
    // Setup interval for polling
    const intervalId = setInterval(() => {
      // Check if we should still be polling
      if (finalEventReceivedRef.current) {
        console.log('Final event received, clearing polling interval');
        clearInterval(intervalId);
        return;
      }
      
      pollForEvents();
    }, pollingInterval);
    
    // Cleanup
    return () => {
      console.log('Cleaning up avatar events polling interval');
      clearInterval(intervalId);
    };
  }, [userProfile?.id, agentId, isGenerating, pollingInterval, pollForEvents]);
  
  return {
    avatarEvents,
    latestImageUrl,
    isGenerating,
    generateAvatar,
    cancelGeneration,
    // Manual poll trigger
    pollEvents: pollForEvents,
    // Clear events
    clearEvents: () => {
      setAvatarEvents([]);
      setLatestImageUrl(undefined);
      processedEventsRef.current.clear();
      finalEventReceivedRef.current = false;
    }
  };
}