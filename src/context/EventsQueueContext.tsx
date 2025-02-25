// src/context/EventsQueueContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { listenForEvents } from '../services/messageHandler';
import { useAuth } from '../hooks/useAuth';

// Type for the context value
interface EventsQueueContextType {
  events: any[];
}

// Create the context
export const EventsQueueContext = createContext<EventsQueueContextType | undefined>(undefined);

// Provider component
export const EventsQueueProvider: React.FC<{ children: ReactNode; intervalTime?: number }> = ({ 
  children, 
  intervalTime = 5000 
}) => {
  const [events, setEvents] = useState<any[]>([]);
  const { userProfile } = useAuth();
  
  useEffect(() => {
    // Only set up the listener if we have a user ID
    if (!userProfile?.id) return;
    
    // Function to fetch events
    const fetchEvents = async () => {
      const newEvents = await listenForEvents(userProfile.id);
      if (newEvents) {
        setEvents(newEvents);
      }
    };

    // Initial fetch
    fetchEvents();
    
    // Set up interval for regular fetches
    const intervalId = setInterval(fetchEvents, intervalTime);
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [userProfile?.id, intervalTime]);

  // Provide the events to all children
  return (
    <EventsQueueContext.Provider value={{ events }}>
      {children}
    </EventsQueueContext.Provider>
  );
};
