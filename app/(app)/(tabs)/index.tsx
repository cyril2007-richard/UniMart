import { useRouter } from 'expo-router';
import {
  Bell,
  Bike,
  ChevronDown,
  ChevronUp,
  MapPin,
  Package,
  Search,
  ShoppingCart,
  TrendingUp
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import { useListings } from '../../../contexts/ListingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_MARGIN = 20;
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - (CAROUSEL_MARGIN * 2);

export default function HomeScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const carouselRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  // Use real listings instead of placeholder data
  const { listings } = useListings();
  // Get the first 5 listings for the "Fresh Finds" section
  const recentListings = listings.slice(0, 5);

  // Mock Data for Carousel (typically these are static or fetched from a specific ads endpoint)
  const sponsors = [
    {
      id: 1,
      title: 'Campus Essentials',
      description: 'Up to 50% off textbooks & stationery',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
      color: '#4834d4'
    },
    {
      id: 2,
      title: 'Tech Gadgets',
      description: 'Laptops, tablets & accessories',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
      color: '#0984e3'
    },
    {
      id: 3,
      title: 'Fashion Week',
      description: 'Trending styles for students',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
      color: '#e84393'
    },
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
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View>
            <Text style={[styles.appName, { color: theme.text }]}>UniMart</Text>
            <View style={styles.locationRow}>
                <MapPin size={12} color={theme.secondaryText} />
                <Text style={[styles.locationText, { color: theme.secondaryText }]}>University of Benin</Text>
            </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/announcement')}>
            <Bell color={theme.text} size={24} strokeWidth={1.5} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
            <ShoppingCart color={theme.text} size={24} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <TouchableOpacity 
            onPress={() => router.push('/search')}
            style={[styles.searchBar, { backgroundColor: theme.surface }]}
            activeOpacity={0.9}
          >
            <Search color={theme.purple} size={20} strokeWidth={2.5} />
            <Text style={[styles.searchInput, { color: theme.secondaryText }]}>What are you looking for?</Text>
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
                  >
                    <ImageBackground 
                        source={{ uri: sponsor.image }} 
                        style={styles.carouselBg}
                        imageStyle={{ borderRadius: 20 }}
                    >
                        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
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
                    backgroundColor: activeIndex === index ? theme.purple : '#E0E0E0',
                    width: activeIndex === index ? 24 : 8,
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => setShowQuickActions(!showQuickActions)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>Quick Actions</Text>
            {showQuickActions ? (
              <ChevronUp size={20} color={theme.secondaryText} />
            ) : (
              <ChevronDown size={20} color={theme.secondaryText} />
            )}
          </TouchableOpacity>
          
          {showQuickActions && (
            <View style={styles.quickActionGrid}>
              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.surface }]} onPress={() => router.push('/how-to-buy')}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                      <TrendingUp color="#2196F3" size={24} />
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.text }]}>How to Buy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.surface }]} onPress={() => router.push('/how-to-sell')}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                      <Package color="#4CAF50" size={24} />
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.text }]}>Start Selling</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.surface }]} onPress={() => router.push('/apply')}>
                  <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
                      <Bike color="#FF9800" size={24} />
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.text }]}>Rider Job</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Fresh Finds (Real Data) */}
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>Fresh Finds</Text>
                <TouchableOpacity onPress={() => router.push('/search')}>
                    <Text style={[styles.seeAllText, { color: theme.purple }]}>See All</Text>
                </TouchableOpacity>
            </View>
            
            {recentListings.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20 }}>
                    {recentListings.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={[styles.productCard, { backgroundColor: theme.background }]}
                            onPress={() => router.push(`/product-detail?id=${item.id}`)}
                        >
                            <Image source={{ uri: item.images[0] }} style={styles.productImage} />
                            <View style={styles.productInfo}>
                                <Text numberOfLines={1} style={[styles.productTitle, { color: theme.text }]}>{item.title}</Text>
                                <Text style={[styles.productPrice, { color: theme.purple }]}>₦{item.price.toLocaleString()}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
                    <Text style={{ color: theme.secondaryText }}>No new products yet.</Text>
                </View>
            )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
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
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    borderWidth: 1.5,
    borderColor: 'white',
  },

  // Search
  searchSection: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },

  // Carousel
  scrollContainer: { paddingBottom: 20 },
  carouselSection: { marginVertical: 10 },
  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  carouselBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'flex-end',
    padding: 16,
  },
  carouselContent: {
    gap: 4,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  carouselTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  carouselDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },

  // Sections
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Quick Actions
  quickActionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Product Cards
  productCard: {
    width: 150,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
  }
});