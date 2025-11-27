import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, MoreVertical, Search, X } from 'lucide-react-native';
import React, { useState, useMemo, useCallback } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useChats } from '../../../contexts/ChatContext';

export default function ChatScreen() {
  const router = useRouter();
  const { chats, loading } = useChats();
  const { currentUser } = useAuth();
  const theme = Colors.light;
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.lightPurple} />
      </View>
    );
  }

  const filteredChats = useMemo(() => {
    return chats.map(chat => {
      const otherUserId = chat.participants.find((uid: string) => uid !== currentUser?.id);
      const otherUser = chat.users[otherUserId];
      return { ...chat, otherUser };
    }).filter(chat => {
      if (!chat.otherUser) return false;
      return chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [chats, currentUser, searchQuery]);

  const handleSearchToggle = () => {
      setIsSearching(!isSearching);
      if (isSearching) {
          setSearchQuery('');
      }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const { otherUser } = item;
    if (!otherUser) {
      return null;
    }
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <Image
          source={{ uri: otherUser.avatar || 'https://via.placeholder.com/60' }}
          style={styles.avatar}
        />
        <View style={styles.chatContentContainer}>
            <View style={styles.chatHeader}>
                <Text style={[styles.userName, { color: theme.black }]}>{otherUser.name}</Text>
                {/* Placeholder date, ideally from lastMessage timestamp */}
                <Text style={[styles.dateText, { color: theme.secondaryText }]}>Yesterday</Text> 
            </View>
            <View style={styles.messagePreview}>
                 <Text numberOfLines={1} style={[styles.lastMessage, { color: theme.secondaryText }]}>
                    {item.lastMessage}
                </Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  }, [router, theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* WhatsApp-style Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={styles.headerTop}>
            {isSearching ? (
                <View style={styles.searchContainer}>
                    <TouchableOpacity onPress={handleSearchToggle} style={styles.iconButton}>
                         <ArrowLeft size={24} color={theme.white} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.searchInput, { color: theme.white }]}
                        placeholder="Search..."
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                     {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.iconButton}>
                            <X size={20} color={theme.white} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <>
                    <Text style={[styles.title, { color: theme.white }]}>Unimart</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity 
                            style={styles.iconButton}
                            onPress={handleSearchToggle}
                        >
                            <Search size={22} color={theme.white} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.iconButton}
                            onPress={() => router.push('/settings')}
                        >
                            <MoreVertical size={22} color={theme.white} />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
        {/* Tabs (simplified for this screen, just 'Chats' active) */}
        <View style={styles.tabsContainer}>
            <View style={[styles.tabItem, styles.activeTab]}>
                <Text style={[styles.tabText, styles.activeTabText]}>CHATS</Text>
            </View>
        </View>
      </View>
      
      {filteredChats.length === 0 ? (
        <View style={styles.centered}>
            {isSearching ? (
                <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No results found</Text>
            ) : (
                <>
                <MessageCircle size={80} color={theme.secondaryText} strokeWidth={1} />
                <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No chats yet</Text>
                <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
                    Messages from sellers will appear here.
                </Text>
                </>
            )}
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
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
        paddingTop: 50,
        paddingBottom: 0,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
        height: 40, // Fixed height to prevent layout jump when switching to search
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 20,
    },
    iconButton: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        marginLeft: 10,
        marginRight: 10,
    },
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabIcon: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: 'white',
    },
    tabText: {
        fontWeight: '700',
        fontSize: 14,
    },
    activeTabText: {
        color: 'white',
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
        paddingTop: 8,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
        backgroundColor: Colors.light.surface,
    },
    chatContentContainer: {
        flex: 1,
        justifyContent: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.light.surface,
        paddingBottom: 15,
        marginTop: 5,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    dateText: {
        fontSize: 12,
    },
    messagePreview: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});