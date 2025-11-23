// contexts/ChatContext.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
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
      const interactionsRef = collection(db, 'users', currentUser.id, 'interactions');
      const unsubscribe = onSnapshot(interactionsRef, async (snapshot) => {
        try {
          const interactions = snapshot.docs.map(doc => doc.id);
          const chatsData: Chat[] = [];

          for (const userId of interactions) {
            const sortedParticipants = [currentUser.id, userId].sort();
            const q = query(
              collection(db, 'chats'),
              where('participants', '==', sortedParticipants)
            );
            const chatSnapshot = await getDocs(q);
            if (!chatSnapshot.empty) {
              const chatDoc = chatSnapshot.docs[0];
              chatsData.push({ id: chatDoc.id, ...chatDoc.data() } as Chat);
            }
          }
          setChats(chatsData);
        } catch (error) {
          console.error("Error fetching chats from interactions: ", error);
        } finally {
          setLoading(false);
        }
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
