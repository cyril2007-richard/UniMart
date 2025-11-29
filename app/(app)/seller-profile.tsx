import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, increment, onSnapshot, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore';
import { ChevronLeft, Grid, List, PackageOpen, UserCheck, UserPlus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { type Listing } from '../../contexts/ListingsContext';
import { useNotification } from '../../contexts/NotificationContext';
import { db } from '../../firebase';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2; // Tight gap for mosaic look
const IMAGE_SIZE = (width - ((COLUMN_COUNT - 1) * GAP)) / COLUMN_COUNT;

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = Colors.light;
  
  // Data State
  const [seller, setSeller] = useState<any>(null);
  const [sellerProducts, setSellerProducts] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState('grid');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  // Contexts
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();

  // --- Effects ---
  useEffect(() => {
    if (id) {
      const fetchSellerData = async () => {
        const sellerDocRef = doc(db, 'users', id as string);
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
          const sellerData = { id: sellerDoc.id, ...sellerDoc.data() } as any;
          setSeller(sellerData);
          setFollowerCount(sellerData.followers || 0);
        }

        const q = query(collection(db, 'listings'), where('sellerId', '==', id));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        setSellerProducts(products);
      };
      fetchSellerData();
    }
  }, [id]);

  useEffect(() => {
    if (!currentUser || !id) return;
    const followerDocRef = doc(db, 'users', id as string, 'followers', currentUser.id);
    const unsubscribe = onSnapshot(followerDocRef, (doc) => {
        setIsFollowing(doc.exists());
    });
    return () => unsubscribe();
  }, [id, currentUser]);

  // --- Handlers ---
  const handleFollowToggle = async () => {
    if (!currentUser) {
        router.push('/(auth)/login');
        return;
    }
    if (!seller) return;

    // Optimistic Update
    const previousIsFollowing = isFollowing;
    const previousFollowerCount = followerCount;

    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);

    const batch = writeBatch(db);
    // ... (Your existing batch logic is perfect, keeping it simplified here for brevity)
    const currentUserFollowingRef = doc(db, 'users', currentUser.id, 'following', seller.id);
    const sellerFollowersRef = doc(db, 'users', seller.id, 'followers', currentUser.id);
    const currentUserDocRef = doc(db, 'users', currentUser.id);
    const sellerDocRef = doc(db, 'users', seller.id);

    try {
        if (previousIsFollowing) { // Unfollow
            batch.delete(currentUserFollowingRef);
            batch.delete(sellerFollowersRef);
            batch.update(currentUserDocRef, { following: increment(-1) });
            batch.update(sellerDocRef, { followers: increment(-1) });
        } else { // Follow
            batch.set(currentUserFollowingRef, { userId: seller.id, createdAt: serverTimestamp() });
            batch.set(sellerFollowersRef, { userId: currentUser.id, createdAt: serverTimestamp() });
            batch.update(currentUserDocRef, { following: increment(1) });
            batch.update(sellerDocRef, { followers: increment(1) });
        }
        await batch.commit();
    } catch (error) {
        console.error("Error toggling follow: ", error);
        setIsFollowing(previousIsFollowing);
        setFollowerCount(previousFollowerCount);
        addNotification("Failed to update follow status", "error");
    }
  };

  const handleMessageSeller = async () => {
    if (!currentUser) {
      router.push('/(auth)/login');
      return;
    }
    if (!seller || isCreatingChat) return;

    setIsCreatingChat(true);
    // ... (Your existing chat logic)
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', currentUser.id));
      const querySnapshot = await getDocs(q);
      let existingChat: any = null;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(seller.id)) {
          existingChat = { id: doc.id, ...data };
        }
      });

      if (existingChat) {
        router.push(`/chat/${existingChat.id}`);
      } else {
        const sortedParticipants = [currentUser.id, seller.id].sort();
        const newChatRef = await addDoc(chatsRef, {
          participants: sortedParticipants,
          lastMessage: '',
          lastUpdatedAt: serverTimestamp(),
          users: {
            [currentUser.id]: { name: currentUser.name, avatar: currentUser.profilePicture },
            [seller.id]: { name: seller.name, avatar: seller.profilePicture }
          }
        });
        
        // Add Interactions logic here (omitted for brevity, keep your original code)
        const currentUserInteractionsRef = doc(db, 'users', currentUser.id, 'interactions', seller.id);
        await setDoc(currentUserInteractionsRef, { name: seller.name, avatar: seller.profilePicture, chatId: newChatRef.id });
        const sellerInteractionsRef = doc(db, 'users', seller.id, 'interactions', currentUser.id);
        await setDoc(sellerInteractionsRef, { name: currentUser.name, avatar: currentUser.profilePicture, chatId: newChatRef.id });

        router.push(`/chat/${newChatRef.id}`);
      }
    } catch (error) {
      addNotification('Failed to start chat.', 'error');
    } finally {
      setIsCreatingChat(false);
    }
  };

  if (!seller) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.purple} />
      </View>
    );
  }

  // --- Render Components ---

  const renderHeader = () => (
    <View style={{ backgroundColor: theme.background }}>
      {/* Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>{seller.username}</Text>
        <View style={{width: 28}} /> 
      </View>

      <View style={styles.profileContainer}>
        {/* Top Row: Avatar + Stats */}
        <View style={styles.statsRow}>
            <Image
                source={{ uri: seller.profilePicture }}
                style={styles.avatar}
            />
            
            <View style={styles.statsData}>
                <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: theme.text }]}>{sellerProducts.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: theme.text }]}>{followerCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: theme.text }]}>{seller.following || 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Following</Text>
                </View>
            </View>
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
            <Text style={[styles.realName, { color: theme.text }]}>{seller.name}</Text>
            {/* Optional Bio Text could go here */}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
            <TouchableOpacity 
                style={[
                    styles.followBtn, 
                    { backgroundColor: isFollowing ? theme.surface : theme.purple }
                ]} 
                onPress={handleFollowToggle}
                disabled={currentUser?.id === seller.id}
            >
                {isFollowing ? (
                    <>
                        <Text style={[styles.btnText, { color: theme.text }]}>Following</Text>
                        <UserCheck size={16} color={theme.text} style={{ marginLeft: 6 }} />
                    </>
                ) : (
                    <>
                        <Text style={[styles.btnText, { color: 'white' }]}>Follow</Text>
                        <UserPlus size={16} color="white" style={{ marginLeft: 6 }} />
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.messageBtn, { backgroundColor: theme.surface }]}
                onPress={handleMessageSeller}
                disabled={isCreatingChat}
            >
                {isCreatingChat ? (
                   <ActivityIndicator size="small" color={theme.text} />
                ) : (
                   <Text style={[styles.btnText, { color: theme.text }]}>Message</Text>
                )}
            </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.surface }]}>
        <TouchableOpacity onPress={() => setActiveTab('grid')} style={[styles.tab, activeTab === 'grid' && { borderBottomColor: theme.text }]}>
          <Grid size={24} color={activeTab === 'grid' ? theme.text : theme.secondaryText} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('list')} style={[styles.tab, activeTab === 'list' && { borderBottomColor: theme.text }]}>
          <List size={24} color={activeTab === 'list' ? theme.text : theme.secondaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150';
    
    if (activeTab === 'grid') {
      return (
        <TouchableOpacity 
            activeOpacity={0.8}
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, marginBottom: GAP }} 
            onPress={() => router.push(`/product-detail?id=${item.id}`)}
        >
          <Image source={{ uri: imageUrl }} style={styles.gridImage} />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.listItem, { backgroundColor: theme.surface }]} 
            onPress={() => router.push(`/product-detail?id=${item.id}`)}
        >
          <Image source={{ uri: imageUrl }} style={styles.listImage} />
          <View style={styles.listInfo}>
            <Text numberOfLines={1} style={[styles.listTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.listPrice, { color: theme.purple }]}>₦{item.price.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="dark-content" />
        <FlatList
          key={activeTab} // Forces re-render on tab switch
          data={sellerProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={activeTab === 'grid' ? COLUMN_COUNT : 1}
          columnWrapperStyle={activeTab === 'grid' ? { gap: GAP } : undefined}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={activeTab === 'list' ? { paddingHorizontal: 16, paddingBottom: 40 } : { paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <PackageOpen size={48} color={theme.secondaryText} />
                <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No listings yet</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]} // Optional: Keeps header slightly visible or use specific index for Tab bar if split
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Navigation
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: { padding: 4 },
  navTitle: { fontSize: 16, fontWeight: '700' },

  // Profile Section
  profileContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 86, height: 86, borderRadius: 43, marginRight: 20 },
  statsData: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 13 },
  
  bioContainer: { marginBottom: 16 },
  realName: { fontSize: 16, fontWeight: '700' },

  // Actions
  actionButtons: { flexDirection: 'row', gap: 8 },
  followBtn: { flex: 1, flexDirection: 'row', height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  messageBtn: { flex: 1, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontWeight: '600' },

  // Tabs
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'transparent' },

  // Grid
  gridImage: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' },

  // List
  listItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 8, marginBottom: 8 },
  listImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  listPrice: { fontSize: 14, fontWeight: '700' },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 16 },
});