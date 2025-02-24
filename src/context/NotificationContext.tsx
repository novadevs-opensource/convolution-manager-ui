import React, { createContext, useState, ReactNode, useEffect, useRef } from 'react';

// Añadimos un ID único para cada notificación
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'error') => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Usamos useRef para mantener un registro de los timeouts
  const timeoutsRef = useRef<{ [key: string]: { hide: NodeJS.Timeout | null, remove: NodeJS.Timeout | null } }>({});

  // Limpiamos todos los timeouts cuando el componente se desmonta
  useEffect(() => {
    return () => {
      // Limpiar todos los timeouts guardados
      Object.values(timeoutsRef.current).forEach(timers => {
        if (timers.hide) clearTimeout(timers.hide);
        if (timers.remove) clearTimeout(timers.remove);
      });
    };
  }, []);

  const addNotification = (message: string, type: 'success' | 'error') => {
    // Generamos un ID único para cada notificación
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Primero creamos la notificación con isVisible=false para la animación de entrada
    const newNotification: Notification = {
      id,
      message,
      type,
      isVisible: false
    };

    // Añadimos la nueva notificación al estado
    setNotifications(prev => [...prev, newNotification]);
    
    // Guardamos los timers para esta notificación
    timeoutsRef.current[id] = {
      hide: null,
      remove: null
    };
    
    // Forzamos un pequeño delay para que React pueda renderizar antes de la animación
    setTimeout(() => {
      // Hacemos visible la notificación para iniciar la animación de entrada
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, isVisible: true } : notification
        )
      );
      
      // Configuramos el timer para ocultar la notificación después de 3 segundos
      const hideTimer = setTimeout(() => {
        setNotifications(prev => {
          // Verificamos que la notificación todavía exista
          const exists = prev.some(n => n.id === id);
          if (!exists) return prev;
          
          // Actualizamos isVisible a false para iniciar la animación de salida
          return prev.map(notification => 
            notification.id === id ? { ...notification, isVisible: false } : notification
          );
        });
        
        // Configuramos el timer para eliminar la notificación después de la animación
        const removeTimer = setTimeout(() => {
          setNotifications(prev => prev.filter(notification => notification.id !== id));
          // Eliminamos las referencias a los timers
          delete timeoutsRef.current[id];
        }, 500);
        
        // Guardamos el timer de eliminación
        if (timeoutsRef.current[id]) {
          timeoutsRef.current[id].remove = removeTimer;
        }
      }, 3000);
      
      // Guardamos el timer de ocultación
      if (timeoutsRef.current[id]) {
        timeoutsRef.current[id].hide = hideTimer;
      }
    }, 50);
  };

  const removeNotification = (id: string) => {
    // Cancelamos los timers existentes para esta notificación
    if (timeoutsRef.current[id]) {
      if (timeoutsRef.current[id].hide) {
        clearTimeout(timeoutsRef.current[id].hide);
      }
      if (timeoutsRef.current[id].remove) {
        clearTimeout(timeoutsRef.current[id].remove);
      }
    }

    // Iniciamos la animación de salida
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isVisible: false } : notification
      )
    );

    // Después de la animación, eliminamos la notificación
    const removeTimer = setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      // Limpiamos la referencia
      delete timeoutsRef.current[id];
    }, 500);
    
    // Guardamos el nuevo timer de eliminación
    if (timeoutsRef.current[id]) {
      timeoutsRef.current[id].remove = removeTimer;
    } else {
      timeoutsRef.current[id] = {
        hide: null,
        remove: removeTimer
      };
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};