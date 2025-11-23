import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useChats } from '../../../contexts/ChatContext';
import { MessageCircle } from 'lucide-react-native';

export default function ChatScreen() {
  const router = useRouter();
  const { chats, loading } = useChats();
  const { currentUser } = useAuth();
  const theme = Colors.light;

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.purple} />
      </View>
    );
  }

  const getOtherUser = (chat: any) => {
    const otherUserId = chat.participants.find((uid: string) => uid !== currentUser?.id);
    return chat.users[otherUserId];
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Chats</Text>
      </View>
      
      {chats.length === 0 ? (
        <View style={styles.centered}>
          <MessageCircle size={80} color={theme.secondaryText} strokeWidth={1} />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No chats yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
            Messages from sellers will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, index }) => {
            const otherUser = getOtherUser(item);
            if (!otherUser) {
              return null;
            }
            return (
              <TouchableOpacity
                style={[styles.chatItem, { borderTopWidth: index === 0 ? 0 : 1, borderColor: theme.surface }]}
                onPress={() => router.push(`/chat/${item.id}`)}
              >
                <Image
                  source={{ uri: otherUser.avatar || 'https://via.placeholder.com/60' }}
                  style={styles.avatar}
                />
                <View style={styles.chatContent}>
                  <Text style={[styles.userName, { color: theme.text }]}>{otherUser.name}</Text>
                  <Text numberOfLines={1} style={[styles.lastMessage, { color: theme.secondaryText }]}>
                    {item.lastMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '600',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    listContainer: {
        paddingHorizontal: 24,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
        backgroundColor: '#eee',
    },
    chatContent: {
        flex: 1,
    },
    userName: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 14,
    },
});