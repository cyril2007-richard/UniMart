import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'error' | 'info') => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser) {
        setLoading(true);
        const notificationDocRef = doc(db, 'notifications', currentUser.id);
        const notificationDoc = await getDoc(notificationDocRef);
        if (notificationDoc.exists()) {
          setNotifications(notificationDoc.data().items || []);
        } else {
          setNotifications([]);
        }
        setLoading(false);
      } else {
        setNotifications([]);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const updateNotificationsInFirestore = async (items: Notification[]) => {
    if (currentUser) {
      const notificationDocRef = doc(db, 'notifications', currentUser.id);
      await setDoc(notificationDocRef, { items });
    }
  };

  const addNotification = async (message: string, type: 'success' | 'error' | 'info') => {
    const newNotification = { id: Date.now().toString(), message, type };
    const newNotifications = [newNotification, ...notifications];
    setNotifications(newNotifications);
    await updateNotificationsInFirestore(newNotifications);
  };

  const removeNotification = async (id: string) => {
    const newNotifications = notifications.filter((notification) => notification.id !== id);
    setNotifications(newNotifications);
    await updateNotificationsInFirestore(newNotifications);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
