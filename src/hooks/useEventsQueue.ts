import { useContext } from "react";
import { EventsQueueContext } from "../context/EventsQueueContext";

export const useEventsQueue = (): any[] => {
  const context = useContext(EventsQueueContext);
  
  if (context === undefined) {
    throw new Error('useEventsQueue must be used within an EventsQueueProvider');
  }
  
  return context.events;
};