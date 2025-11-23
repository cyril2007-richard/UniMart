import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import Colors from "../../../constants/Colors";
import { db } from "../../../firebase";
import { doc, getDoc, collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAuth } from "../../../contexts/AuthContext";
import { ChevronLeft, Video, Phone, Smile, Send } from "lucide-react-native";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const { currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState<any>(null);
  const theme = Colors.light;

  useEffect(() => {
    if (id) {
      const chatDocRef = doc(db, 'chats', id as string);
      const messagesCollectionRef = collection(db, 'chats', id as string, 'messages');
      const q = query(messagesCollectionRef, orderBy('createdAt'));

      const unsubscribeChat = onSnapshot(chatDocRef, async (chatDoc) => {
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          setChat({ id: chatDoc.id, ...chatData });

          if (currentUser && chatData.participants) {
            const otherUserId = chatData.participants.find((uid: string) => uid !== currentUser.id);
            if (otherUserId) {
              const userDocRef = doc(db, 'users', otherUserId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                setOtherUser(userDoc.data());
              }
            }
          }
        }
      });

      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
      });

      return () => {
        unsubscribeChat();
        unsubscribeMessages();
      };
    }
  }, [id, currentUser]);

  const sendMessage = async () => {
    if (!text.trim() || !currentUser) return;
    const messagesCollectionRef = collection(db, 'chats', id as string, 'messages');
    await addDoc(messagesCollectionRef, {
      text: text,
      senderId: currentUser.id,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  if (!chat || !otherUser) return null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.surface }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -300}
      >
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <Image
              source={{ uri: otherUser.profilePicture || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
            <Text style={[styles.userName, { color: theme.text }]}>{otherUser.name}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity>
                <Video size={22} color={theme.purple} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Phone size={22} color={theme.purple} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.senderId === currentUser?.id ? styles.myMessage : [styles.theirMessage, {backgroundColor: theme.background}],
              ]}
            >
              <Text style={{ color: item.senderId === currentUser?.id ? 'white' : theme.text }}>{item.text}</Text>
            </View>
          )}
          inverted
        />

        <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
          <TouchableOpacity>
            <Smile size={24} color={theme.secondaryText} style={styles.inputIcon} />
          </TouchableOpacity>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor={theme.secondaryText}
            style={[styles.textInput, { backgroundColor: theme.surface, color: theme.text }]}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Send size={24} color={theme.purple} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backButton: {
        padding: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        fontWeight: '600',
        fontSize: 16,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    messageList: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    messageBubble: {
        padding: 12,
        marginVertical: 4,
        borderRadius: 12,
        maxWidth: '75%',
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.light.purple,
    },
    theirMessage: {
        alignSelf: 'flex-start',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderTopWidth: 1,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 8,
    },
});
