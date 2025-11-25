import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where, onSnapshot, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { Grid, List, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { type Listing } from '../../contexts/ListingsContext';
import { db } from '../../firebase';

const { width } = Dimensions.get('window');
const imageSize = (width - 40) / 3; // (padding - gaps) / numColumns

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams();
  const [seller, setSeller] = useState<any>(null);
  const [sellerProducts, setSellerProducts] = useState<Listing[]>([]);
  const theme = Colors.light;
  const [activeTab, setActiveTab] = useState('grid');
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchSellerData = async () => {
        const sellerDocRef = doc(db, 'users', id as string);
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
          const sellerData = { id: sellerDoc.id, ...sellerDoc.data() };
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

  useEffect(() => {
    if (!currentUser || !id) return;
    const followerDocRef = doc(db, 'users', id as string, 'followers', currentUser.id);
    const unsubscribe = onSnapshot(followerDocRef, (doc) => {
        setIsFollowing(doc.exists());
    });
    return () => unsubscribe();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !seller || isLoadingFollow) return;
    setIsLoadingFollow(true);

    const batch = writeBatch(db);
    const currentUserFollowingRef = doc(db, 'users', currentUser.id, 'following', seller.id);
    const sellerFollowersRef = doc(db, 'users', seller.id, 'followers', currentUser.id);
    const currentUserDocRef = doc(db, 'users', currentUser.id);
    const sellerDocRef = doc(db, 'users', seller.id);

    try {
        if (isFollowing) { // Unfollow
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
        setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
        setIsFollowing(!isFollowing);
    } catch (error) {
        console.error("Error toggling follow: ", error);
    } finally {
        setIsLoadingFollow(false);
    }
  };

  if (!seller) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ fontSize: 16, color: theme.text }}>Seller not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ChevronLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.username, { color: theme.text }]}>{seller.username}</Text>
            <View style={{width: 24}}/>
        </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: seller.profilePicture }}
          style={styles.profilePicture}
        />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{sellerProducts.length}</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Listings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{followerCount}</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{seller.following}</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={[styles.name, { color: theme.text }]}>{seller.name}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
            style={[
                isFollowing ? styles.secondaryButton : styles.primaryButton, 
                isFollowing ? { borderColor: theme.purple } : { backgroundColor: theme.purple }
            ]} 
            onPress={handleFollowToggle}
            disabled={isLoadingFollow || currentUser?.id === seller.id}
        >
            {isLoadingFollow ? (
                <ActivityIndicator color={isFollowing ? theme.purple : theme.white} />
            ) : (
                <Text style={[
                    isFollowing ? styles.secondaryButtonText : styles.primaryButtonText, 
                    { color: isFollowing ? theme.purple : theme.white }
                ]}>
                    {isFollowing ? 'Following' : 'Follow'}
                </Text>
            )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.purple }]}>
          <Text style={[styles.secondaryButtonText, { color: theme.purple }]}>Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('grid')} style={[styles.tab, activeTab === 'grid' && styles.activeTab]}>
          <Grid size={24} color={activeTab === 'grid' ? theme.purple : theme.tabIconDefault} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('list')} style={[styles.tab, activeTab === 'list' && styles.activeTab]}>
          <List size={24} color={activeTab === 'list' ? theme.purple : theme.tabIconDefault} />
        </TouchableOpacity>
      </View>

      {activeTab === 'grid' ? (
        <FlatList
          data={sellerProducts}
          numColumns={3}
          scrollEnabled={false} // Disables scrolling for the inner FlatList
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listingItem} onPress={() => router.push(`/product-detail?id=${item.id}`)}>
              {/* --- FIX #1 --- */}
              <Image source={{ uri: item.images[0] }} style={styles.listingImage} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.listingRow}
        />
      ) : (
        <FlatList
          data={sellerProducts}
          scrollEnabled={false} // Disables scrolling for the inner FlatList
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => router.push(`/product-detail?id=${item.id}`)}>
              {/* --- FIX #2 --- */}
              <Image source={{ uri: item.images[0] }} style={styles.listImage} />
              <View style={styles.listItemDetails}>
                {/* --- FIX #3 --- */}
                <Text style={styles.listItemTitle}>{item.title}</Text>
                <Text style={styles.listItemPrice}>₦{item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  bioSection: {
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    // Note: You might want to add borderBottomColor: theme.purple here
  },
  listingRow: {
    justifyContent: 'space-between',
  },
  listingItem: {
    width: imageSize,
    height: imageSize,
    marginBottom: 10,
  },
  listingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  listImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  listItemDetails: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItemPrice: {
    fontSize: 14,
    color: Colors.light.purple,
    marginTop: 5,
  },
  listViewContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  backButton: {
      padding: 5,
  }
});