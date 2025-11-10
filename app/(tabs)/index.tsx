import { useRouter } from 'expo-router';
import { Bell, Bike, Package, Search, Settings, ShoppingCart, TrendingUp } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 60;
const CAROUSEL_SPACING = 16;

export default function HomeScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const carouselRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const sponsors = [
    {
      id: 1,
      title: 'Campus Essentials Sale',
      description: 'Up to 50% off on textbooks and stationery',
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
      <View style={[styles.headerContainer, { backgroundColor: theme.background, borderBottomColor: theme.background }]}>
        <Text style={[styles.appName, { color: theme.text }]}>Unimart</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
            <ShoppingCart color={theme.text} size={22} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/announcement')}>
            <Bell color={theme.text} size={22} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
            <Settings color={theme.text} size={22} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          onPress={() => router.push('/search')}
          style={[styles.searchBar, { backgroundColor: '#f5f5f7' }]}
          activeOpacity={0.7}
        >
          <Search color={theme.tabIconDefault} size={20} strokeWidth={2} />
          <Text style={[styles.searchInput, { color: theme.tabIconDefault }]}>Search products, sellers...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Sponsors Carousel */}
        <View style={styles.carouselSection}>
          <Text style={[styles.carouselLabel, { color: theme.tabIconDefault }]}>Featured Offers</Text>
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
            {sponsors.map((sponsor, index) => (
              <TouchableOpacity
                key={sponsor.id}
                style={[
                  styles.carouselCard,
                  { 
                    backgroundColor: '#fff',
                    marginLeft: index === 0 ? 20 : 0,
                    marginRight: index === sponsors.length - 1 ? 20 : CAROUSEL_SPACING,
                  }
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.carouselContent}>
                  <Text style={[styles.carouselTitle, { color: theme.text }]}>
                    {sponsor.title}
                  </Text>
                  <Text style={[styles.carouselDescription, { color: theme.tabIconDefault }]}>
                    {sponsor.description}
                  </Text>
                </View>
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
                    backgroundColor: activeIndex === index ? '#000' : '#d1d1d6',
                    width: activeIndex === index ? 24 : 8,
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#fff' }]} onPress={() => router.push('/how-to-buy')}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#4CAF50' }]}>
              <TrendingUp color="#fff" size={22} strokeWidth={2.5} />
            </View>
            <Text style={[styles.actionTitle, { color: theme.text }]}>How to Buy</Text>
            <Text style={[styles.actionSubtitle, { color: theme.tabIconDefault }]}>
              Start shopping
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#fff' }]} onPress={() => router.push('/how-to-sell')}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#2196F3' }]}>
              <Package color="#fff" size={22} strokeWidth={2.5} />
            </View>
            <Text style={[styles.actionTitle, { color: theme.text }]}>How to Sell</Text>
            <Text style={[styles.actionSubtitle, { color: theme.tabIconDefault }]}>
              List your items
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#fff' }]} onPress={() => router.push('/apply')}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#FF9800' }]}>
              <Bike color="#fff" size={22} strokeWidth={2.5} />
            </View>
            <Text style={[styles.actionTitle, { color: theme.text }]}>Become Rider</Text>
            <Text style={[styles.actionSubtitle, { color: theme.tabIconDefault }]}>
              Earn extra cash
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
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
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  carouselSection: {
    marginBottom: 8,
  },
  carouselLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  carouselContainer: {
    paddingVertical: 8,
  },
  carouselCard: {
    width: CAROUSEL_ITEM_WIDTH,
    borderRadius: 16,
    padding: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  carouselContent: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  carouselDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
});