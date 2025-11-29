import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Camera, ChevronLeft, MoreVertical, Paperclip, Send, Smile } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import Colors from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";
import { db, storage } from "../../../firebase";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const { currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const theme = Colors.light;

  const onEmojiSelect = (emoji: string) => {
    setText(prevText => prevText + emoji);
  };

  const toggleEmojiPicker = () => {
    Keyboard.dismiss();
    setShowEmojiPicker(prev => !prev);
  }

  useEffect(() => {
    if (id) {
      const chatDocRef = doc(db, 'chats', id as string);
      const messagesCollectionRef = collection(db, 'chats', id as string, 'messages');
      const q = query(messagesCollectionRef, orderBy('createdAt', 'asc'));

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
                setOtherUser({ id: userDoc.id, ...userDoc.data() });
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
      type: 'text'
    });
    setText("");
  };

  const sendImageMessage = async (uri: string) => {
    if (!currentUser || !id) return;
    setUploading(true);
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `chat-images/${id}/${Date.now()}`;
        const storageRef = ref(storage, filename);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        const messagesCollectionRef = collection(db, 'chats', id as string, 'messages');
        await addDoc(messagesCollectionRef, {
            imageUrl: downloadURL,
            senderId: currentUser.id,
            createdAt: serverTimestamp(),
            type: 'image'
        });
    } catch (error) {
        console.error("Error uploading image: ", error);
    } finally {
        setUploading(false);
    }
  };

  const handleAttachment = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        await sendImageMessage(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted === false) {
        alert("You've refused to allow this app to access your camera!");
        return;
    }
    const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        await sendImageMessage(result.assets[0].uri);
    }
  };

  if (!chat || !otherUser) return null;

  // Formatting timestamp (placeholder logic)
  const formatTime = (timestamp: any) => {
      if (!timestamp) return "Now";
      const date = timestamp.toDate ? timestamp.toDate() : new Date();
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {/* WhatsApp Background Pattern Placeholder - using a solid beige for now as exact pattern asset isn't available */}
      <View style={[styles.container, { backgroundColor: theme.chatBackground }]}> 
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={theme.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push(`/seller-profile?id=${otherUser.id}`)}
            >
              <Image
                source={{ uri: otherUser.profilePicture || 'https://via.placeholder.com/40' }}
                style={styles.avatar}
              />
              <View style={{marginLeft: 10}}>
                  <Text style={[styles.userName, { color: theme.white }]}>{otherUser.name}</Text>
                  <Text style={[styles.userStatus, { color: theme.white }]}>online</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
             <TouchableOpacity style={styles.headerIcon}>
                <MoreVertical size={20} color={theme.white} />
             </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => {
                const isMyMessage = item.senderId === currentUser?.id;
                return (
                    <View
                        style={[
                            styles.messageBubble,
                            isMyMessage ? styles.myMessage : styles.theirMessage,
                            { backgroundColor: isMyMessage ? theme.messageBubbleSender : theme.white }
                        ]}
                    >
                        {item.type === 'image' && item.imageUrl ? (
                            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} resizeMode="cover" />
                        ) : (
                            <Text style={[styles.messageText, { color: theme.black }]}>{item.text}</Text>
                        )}
                        <Text style={[styles.timestamp, { textAlign: 'right' }]}>
                             {formatTime(item.createdAt)}
                        </Text>
                    </View>
                );
            }}
            />

            {showEmojiPicker && (
            <View style={[styles.emojiPicker, {backgroundColor: theme.surface}]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['😀', '😂', '👍', '❤️', '🙏', '🤔', '😊', '😍', '🎉', '🔥', '💯', '😢'].map(emoji => (
                    <TouchableOpacity key={emoji} onPress={() => onEmojiSelect(emoji)}>
                        <Text style={styles.emoji}>{emoji}</Text>
                    </TouchableOpacity>
                ))}
                </ScrollView>
            </View>
            )}

            {uploading && (
                <View style={styles.uploadingContainer}>
                    <ActivityIndicator size="small" color={theme.purple} />
                    <Text style={{ marginLeft: 10, color: theme.text }}>Sending image...</Text>
                </View>
            )}

            <View style={styles.inputWrapper}>
                <View style={[styles.inputContainer, { backgroundColor: theme.white }]}>
                    <TouchableOpacity onPress={toggleEmojiPicker}>
                        <Smile size={24} color={theme.secondaryText} style={styles.inputIcon} />
                    </TouchableOpacity>
                    <TextInput
                        value={text}
                        onChangeText={setText}
                        onFocus={() => setShowEmojiPicker(false)}
                        placeholder="Message"
                        placeholderTextColor={theme.secondaryText}
                        style={[styles.textInput, { color: theme.text }]}
                        multiline
                    />
                     <TouchableOpacity style={styles.inputIcon} onPress={handleAttachment}>
                        <Paperclip size={20} color={theme.secondaryText} />
                    </TouchableOpacity>
                    {text.length === 0 && (
                         <TouchableOpacity style={styles.inputIcon} onPress={handleCamera}>
                            <Camera size={20} color={theme.secondaryText} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity 
                    onPress={text.length > 0 ? sendMessage : undefined} 
                    style={[styles.sendButton, { backgroundColor: theme.headerBackground }]} 
                >
                    <Send size={20} color={theme.white} style={{ marginLeft: 2 }} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </View>
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
        paddingTop: 50,
        paddingBottom: 10,
        paddingHorizontal: 10,
        elevation: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 4,
        marginRight: 4,
        borderRadius: 20,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    userName: {
        fontWeight: '700',
        fontSize: 16,
    },
    userStatus: {
        fontSize: 11,
        opacity: 0.8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    headerIcon: {
        padding: 5,
    },
    messageList: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    messageBubble: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginVertical: 2,
        borderRadius: 10,
        maxWidth: '80%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
    },
    myMessage: {
        alignSelf: 'flex-end',
        borderTopRightRadius: 0,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 15,
        marginBottom: 2,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 10,
        color: Colors.light.secondaryText,
        alignSelf: 'flex-end',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 6,
        paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 6,
        elevation: 1,
    },
    inputIcon: {
        marginHorizontal: 5,
    },
    textInput: {
        flex: 1,
        maxHeight: 100,
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    emojiPicker: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.light.surface,
    },
    emoji: {
        fontSize: 30,
        marginHorizontal: 8,
    },
    uploadingContainer: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
    }
});