// contexts/ChatContext.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export interface Chat {
  id: string;
  participants: string[];
  users: {
    [key: string]: {
      name: string;
      avatar: string;
    };
  };
  lastMessage: string;
  lastUpdatedAt: any;
}

interface ChatContextType {
  chats: Chat[];
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('currentUser in ChatProvider:', currentUser);

  useEffect(() => {
    if (currentUser?.id) {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUser.id),
        orderBy('lastUpdatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        const chatsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Chat));
        setChats(chatsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching chats: ", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setChats([]);
      setLoading(false);
    }
  }, [currentUser?.id]);

  return (
    <ChatContext.Provider value={{ chats, loading }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChats = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChats must be used within a ChatProvider');
  }
  return context;
};
