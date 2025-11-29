import { useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useChats } from '../../../contexts/ChatContext';

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { chats, loading } = useChats();
  const { currentUser } = useAuth();
  const theme = Colors.light;
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredChats = chats.filter((chat) => {
    const otherUser = getOtherUser(chat);
    if (!otherUser) return false;
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSearchToggle = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchQuery('');
    }
  };

  const renderChatItem = ({ item }: { item: any }) => {
    const otherUser = getOtherUser(item);
    if (!otherUser) return null;

    // Format date logic (simplified for demo)
    const getDateLabel = () => {
        // You can use a library like date-fns here
        return "Yesterday"; 
    };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.chatItem, { backgroundColor: theme.background }]}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <Image
          source={{ uri: otherUser.avatar || 'https://via.placeholder.com/60' }}
          style={styles.avatar}
        />
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text numberOfLines={1} style={[styles.userName, { color: theme.text }]}>
              {otherUser.name}
            </Text>
            <Text style={[styles.dateText, { color: theme.secondaryText }]}>
              {getDateLabel()}
            </Text>
          </View>
          <View style={styles.messageRow}>
            <Text numberOfLines={1} style={[styles.lastMessage, { color: theme.secondaryText }]}>
              {item.lastMessage || 'No messages yet'}
            </Text>
            {/* Optional: Add unread badge here */}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        {isSearching ? (
          <View style={styles.searchBarContainer}>
            <TouchableOpacity onPress={handleSearchToggle} style={styles.iconButton}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <TextInput
              style={[styles.searchInput, { color: theme.text, backgroundColor: theme.surface }]}
              placeholder="Search chats..."
              placeholderTextColor={theme.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.iconButton}>
                <X size={20} color={theme.secondaryText} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.defaultHeader}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Messages</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn} onPress={handleSearchToggle}>
                <Search size={24} color={theme.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {/* Content */}
      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
            {isSearching ? (
                <>
                    <Search size={48} color={theme.surface} />
                    <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No results found</Text>
                </>
            ) : (
                <>
                    <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
                        <MessageSquare size={40} color={theme.purple} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No Messages Yet</Text>
                    <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
                        Conversations with sellers will appear here.
                    </Text>
                </>
            )}
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.surface }]} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    minHeight: 60, // Ensure header has height even if empty
    justifyContent: 'flex-end',
  },
  defaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 28, // Modern large title
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerBtn: {
    padding: 4,
  },
  
  // Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20, // Pill shape
    paddingHorizontal: 16,
    fontSize: 16,
  },
  iconButton: {
    padding: 4,
  },

  // List
  listContent: {
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: '#f0f0f0',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    marginLeft: 86, // Indent separator to align with text
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40, // Visual balance
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});