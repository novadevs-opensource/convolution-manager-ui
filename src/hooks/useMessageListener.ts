// src/hooks/useMessageListener.tsx
import { useEffect, useState } from 'react';
import { listenForEvents } from '../services/messageHandler';

const useMessageListener = (loggedInUserId: string, intervalTime: number = 5000) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Initial call to fetch messages
    const fetchMessages = async () => {
      const newMessages = await listenForEvents(loggedInUserId);
      if (newMessages) {
        setMessages(newMessages); // Update state with the received messages
      }
    };

    // Listen to messages at regular intervals
    const intervalId = setInterval(() => {
      fetchMessages(); // Listen to events every "intervalTime"
    }, intervalTime);

    // Clear the interval and listener when the component unmounts
    return () => clearInterval(intervalId);
  }, [loggedInUserId, intervalTime]); // Dependencies

  return messages;
};

export default useMessageListener;
