// src/components/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import NotificationLayout from './common/layouts/public/NotificationLayout';
import { AgentProvider } from '../context/AgentContext';
import { EventsQueueProvider } from '../context/EventsQueueContext';

const App: React.FC = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX + 20}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    document.addEventListener('mousemove', handleMouseMove);

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('message port closed') ||
        event.reason?.message?.includes('crypto.randomUUID')
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    const handleError = (e: ErrorEvent) => {
      if (
        e.message.includes('The message port closed') ||
        e.message.includes('crypto.randomUUID') ||
        e.message.includes('Failed to fetch chrome-extension')
      ) {
        e.stopImmediatePropagation();
        return true;
      }
      return false;
    };
    window.addEventListener('error', handleError, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError, true);
    };
  }, []);

  return (
    <BrowserRouter>
      <NotificationLayout>
        <EventsQueueProvider>
          <AgentProvider>
            <AppRoutes />
          </AgentProvider>
        </EventsQueueProvider>
      </NotificationLayout>
    </BrowserRouter>
  );
};

export default App;