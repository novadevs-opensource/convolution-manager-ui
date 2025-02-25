// src/components/NotificationLayout.tsx
import React from 'react';

import NotificationToast from '../../toasts/NotificationToast';
import { NotificationProvider } from '../../../context/ToastContext';

interface NotificationLayoutProps {
  children: React.ReactNode;
}

const NotificationLayout: React.FC<NotificationLayoutProps> = ({ children }) => {
  return (
    <NotificationProvider>
      <NotificationToast />
      {children}
    </NotificationProvider>
  );
};

export default NotificationLayout;
