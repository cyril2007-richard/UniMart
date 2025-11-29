import { useRouter } from 'expo-router';
import { Bell, Bike, ChevronDown, ChevronUp, Package, Search, Settings, ShoppingCart, TrendingUp } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 80; // Increased spacing from screen edges
const CAROUSEL_SPACING = 20;

export default function HomeScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const carouselRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(true);

  const sponsors = [
    {
      id: 1,
      title: 'Campus Essentials Sale',
      description: 'Up to 50% off on textbooks and stationery',
      ImageBackground: ""
    },
    {
      id: 2,
      title: 'Tech Gadgets',
      description: 'Laptops, tablets, and accessories',
    },
    {
      id: 3,
      title: 'Fashion Week',
      description: 'Trending styles at student-friendly prices',
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CAROUSEL_ITEM_WIDTH + CAROUSEL_SPACING));
    setActiveIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.appName, { color: theme.text }]}>Unimart</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
            <ShoppingCart color={theme.text} size={24} strokeWidth={1.5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/announcement')}>
            <Bell color={theme.text} size={24} strokeWidth={1.5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
            <Settings color={theme.text} size={24} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TouchableOpacity 
          onPress={() => router.push('/search')}
          style={[styles.searchBar, { backgroundColor: theme.surface }]}
          activeOpacity={0.8}
        >
          <Search color={theme.secondaryText} size={18} strokeWidth={2} />
          <Text style={[styles.searchInput, { color: theme.secondaryText }]}>Search products, sellers...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Offers Carousel */}
        <View style={styles.carouselSection}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CAROUSEL_ITEM_WIDTH + CAROUSEL_SPACING}
            snapToAlignment="start"
            contentContainerStyle={styles.carouselContainer}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {sponsors.map((sponsor) => (
              <TouchableOpacity
                key={sponsor.id}
                style={styles.carouselItem}
                activeOpacity={0.8}
              >
                <Text style={[styles.carouselTitle, { color: theme.text }]}>
                  {sponsor.title}
                </Text>
                <Text style={[styles.carouselDescription, { color: theme.secondaryText }]}>
                  {sponsor.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {sponsors.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: activeIndex === index ? theme.text : theme.surface,
                    width: activeIndex === index ? 16 : 6,
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => setShowQuickActions(!showQuickActions)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Quick Actions</Text>
            {showQuickActions ? (
              <ChevronUp size={20} color={theme.secondaryText} />
            ) : (
              <ChevronDown size={20} color={theme.secondaryText} />
            )}
          </TouchableOpacity>
          
          {showQuickActions && (
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/how-to-buy')}>
                <View style={[styles.actionIconContainer, { backgroundColor: theme.surface }]}>
                  <TrendingUp color={theme.text} size={20} strokeWidth={2} />
                </View>
                <Text style={[styles.actionTitle, { color: theme.text }]}>How to Buy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/how-to-sell')}>
                <View style={[styles.actionIconContainer, { backgroundColor: theme.surface }]}>
                  <Package color={theme.text} size={20} strokeWidth={2} />
                </View>
                <Text style={[styles.actionTitle, { color: theme.text }]}>How to Sell</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/apply')}>
                <View style={[styles.actionIconContainer, { backgroundColor: theme.surface }]}>
                  <Bike color={theme.text} size={20} strokeWidth={2} />
                </View>
                <Text style={[styles.actionTitle, { color: theme.text }]}>Become a Rider</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 35,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  carouselSection: {
    paddingVertical: 16,
  },
  carouselContainer: {
    paddingHorizontal: 24,
  },
  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH,
    padding: 20,
    marginRight: CAROUSEL_SPACING,
    justifyContent: 'center',
    borderRadius: 12,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  carouselDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});