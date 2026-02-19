import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  read: boolean;
  createdAt: any;
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
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Use the subcollection: users/{uid}/notifications
    const notificationsRef = collection(db, 'users', currentUser.id, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(items);
      setLoading(false);
    }, (error) => {
      console.error("Notification subscription error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addNotification = async (message: string, type: 'success' | 'error' | 'info') => {
    if (!currentUser) return;
    try {
      const notificationsRef = collection(db, 'users', currentUser.id, 'notifications');
      await addDoc(notificationsRef, {
        message,
        type,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const removeNotification = async (id: string) => {
    if (!currentUser) return;
    try {
      const notifDocRef = doc(db, 'users', currentUser.id, 'notifications', id);
      await deleteDoc(notifDocRef);
    } catch (error) {
      console.error("Error removing notification:", error);
    }
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
