import { useRouter } from 'expo-router';
import {
  Bell,
  MapPin,
  Search,
  ShoppingCart,
  Bike,
  ChevronRight,
  Star
} from 'lucide-react-native';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import Colors from '../../../constants/Colors';
import { useListings } from '../../../contexts/ListingsContext';
import { useCategories } from '../../../contexts/CategoryContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_MARGIN = 20;
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - (CAROUSEL_MARGIN * 2);

export default function HomeScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const carouselRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
  const [activeDispatches, setActiveDispatches] = useState<any[]>([]);
  
  const { listings, loading, refreshListings } = useListings();
  const { categories } = useCategories();
  const recentListings = listings.slice(0, 6);

  const onRefresh = useCallback(async () => {
    await refreshListings();
  }, [refreshListings]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'receipts'),
      where('buyerId', '==', currentUser.id),
      where('status', 'in', ['rider_assigned', 'in_transit', 'picked_up'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveDispatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [currentUser]);

  const sponsors = [
    {
      id: 1,
      title: 'LIALD Luxe Autohaus',
      description: 'Premium Automobiles - Buy | Sell | Upgrade',
      image: require('../../../assets/images/banner.jpeg'),
      fullImage: require('../../../assets/images/full image.jpeg'),
      color: theme.primary
    }
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={[styles.appName, { color: theme.text }]}>UniMart</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color={theme.mutedText} />
            <Text style={[styles.locationText, { color: theme.mutedText }]}>Local Community</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/announcement')}>
            <Bell color={theme.text} size={22} strokeWidth={1.8} />
            <View style={[styles.notificationDot, { backgroundColor: theme.error }]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
            <ShoppingCart color={theme.text} size={22} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      {activeDispatches.length > 0 && (
        <View style={styles.dispatchNotificationContainer}>
          <TouchableOpacity 
            style={[styles.dispatchNotification, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/receipts')}
            activeOpacity={0.9}
          >
            <View style={styles.dispatchIconContainer}>
              <Bike size={18} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dispatchTitle}>Live Delivery Progress</Text>
              <Text style={styles.dispatchSub}>#{activeDispatches[0].id.slice(0, 8).toUpperCase()} is {activeDispatches[0].status.replace('_', ' ')}</Text>
            </View>
            <ChevronRight size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <TouchableOpacity 
            onPress={() => router.push('/search')}
            style={[styles.searchBar, { backgroundColor: theme.surface }]}
            activeOpacity={0.9}
          >
            <Search color={theme.mutedText} size={20} strokeWidth={2} />
            <Text style={[styles.searchInput, { color: theme.mutedText }]}>Search for products...</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Carousel */}
        <View style={styles.carouselSection}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 0 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {sponsors.map((sponsor) => (
              <View key={sponsor.id} style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.carouselItem}
                  activeOpacity={0.9}
                  onPress={() => setSelectedSponsor(sponsor)}
                >
                  <ImageBackground 
                    source={sponsor.image} 
                    style={styles.carouselBg}
                    imageStyle={{ borderRadius: 14 }}
                  >
                    <View style={[styles.overlay, { backgroundColor: 'rgba(15, 23, 42, 0.4)' }]}>
                      <View style={styles.carouselContent}>
                        <View style={[styles.tag, { backgroundColor: sponsor.color }]}>
                          <Text style={styles.tagText}>Featured</Text>
                        </View>
                        <Text style={styles.carouselTitle}>{sponsor.title}</Text>
                        <Text style={styles.carouselDesc}>{sponsor.description}</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination */}
          <View style={styles.paginationContainer}>
            {sponsors.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: activeIndex === index ? theme.primary : '#E2E8F0',
                    width: activeIndex === index ? 20 : 6,
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Shop by Category (Amazon Style Grid)
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, { color: theme.text, marginBottom: 16 }]}>Shop by Category</Text>
          <View style={styles.categoryGrid}>
            {categories.slice(0, 4).map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.categoryCard, { backgroundColor: theme.surface }]}
                onPress={() => router.push(`/search?category=${cat.id}`)}
              >
                <Text style={[styles.categoryName, { color: theme.text }]}>{cat.name}</Text>
                <View style={styles.categoryImagePlaceholder}>
                  <Image 
                    source={{ uri: `https://api.dicebear.com/7.x/shapes/png?seed=${cat.id}&backgroundColor=EEF1F4` }} 
                    style={styles.categoryImage} 
                  />
                </View>
                <Text style={[styles.shopNow, { color: theme.primary }]}>Shop now</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* Fresh Finds (Amazon Style Grid) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>Fresh Finds for You</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentListings.length > 0 ? (
            <View style={styles.productGrid}>
              {recentListings.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.amazonProductCard, { backgroundColor: theme.surface }]}
                  onPress={() => router.push(`/product-detail?id=${item.id}`)}
                >
                  <View style={styles.amazonProductImageContainer}>
                    <Image source={{ uri: item.images[0] }} style={styles.amazonProductImage} />
                  </View>
                  <View style={styles.amazonProductInfo}>
                    <Text numberOfLines={2} style={[styles.amazonProductTitle, { color: theme.text }]}>{item.title}</Text>
                    <View style={styles.amazonRatingRow}>
                      <Star size={10} color="#F59E0B" fill="#F59E0B" />
                      <Star size={10} color="#F59E0B" fill="#F59E0B" />
                      <Star size={10} color="#F59E0B" fill="#F59E0B" />
                      <Star size={10} color="#F59E0B" fill="#F59E0B" />
                      <Text style={[styles.amazonRatingCount, { color: theme.mutedText }]}>120+</Text>
                    </View>
                    <View style={styles.amazonPriceRow}>
                      <Text style={[styles.amazonPrice, { color: theme.text }]}>
                        <Text style={styles.amazonCurrency}>₦</Text>
                        {item.price.toLocaleString()}
                      </Text>
                    </View>
                    <Text style={[styles.amazonDeliveryInfo, { color: theme.mutedText }]}>Fast delivery</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <Text style={{ color: theme.secondaryText }}>No new products yet.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sponsor Modal */}
      <Modal
        visible={!!selectedSponsor}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedSponsor(null)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setSelectedSponsor(null)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <Image 
                source={selectedSponsor?.fullImage} 
                style={styles.fullSponsorImage} 
                resizeMode="stretch"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  searchSection: {
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    fontWeight: '400',
  },
  scrollContainer: { paddingBottom: 20 },
  carouselSection: { marginVertical: 8 },
  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH,
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
  },
  carouselBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  carouselContent: {
    gap: 6,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 2,
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  carouselTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  carouselDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    height: 5,
    borderRadius: 2.5,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 24 * 2 - 12) / 2,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  categoryImagePlaceholder: {
    height: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  shopNow: {
    fontSize: 12,
    fontWeight: '600',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  amazonProductCard: {
    width: (SCREEN_WIDTH - 24 * 2 - 16) / 2,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: 8,
  },
  amazonProductImageContainer: {
    height: 160,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  amazonProductImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  amazonProductInfo: {
    padding: 12,
  },
  amazonProductTitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 6,
    lineHeight: 18,
  },
  amazonRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 6,
  },
  amazonRatingCount: {
    fontSize: 11,
    marginLeft: 4,
  },
  amazonPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  amazonCurrency: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  amazonPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  amazonDeliveryInfo: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  emptyState: {
    padding: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: '75%',
    backgroundColor: 'white',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalContent: {
    flex: 1,
  },
  fullSponsorImage: {
    width: '100%',
    height: '100%',
  },
  dispatchNotificationContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  dispatchNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dispatchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  dispatchSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
});