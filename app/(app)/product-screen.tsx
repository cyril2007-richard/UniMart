import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Filter,
  Grid,
  List,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
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
import Colors from '../../constants/Colors';
import type { Listing } from '../../contexts/ListingsContext';
import { useListings } from '../../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const PADDING = 16;
const GAP = 12;
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - (PADDING * 2) - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

type SortKey = 'default' | 'price-low' | 'price-high';

export default function ProductScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { listings } = useListings();
  const { categoryId, subcategory, minPrice, maxPrice } = useLocalSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortKey>('default');

  // --- Filter Logic ---
  const filteredByCategory = useMemo(() => {
    return listings.filter((p) => {
      if (categoryId && subcategory) {
        return p.category === categoryId && p.subcategory === subcategory;
      }
      if (categoryId) return p.category === categoryId;
      return true;
    });
  }, [listings, categoryId, subcategory]);

  const filteredByPrice = useMemo(() => {
    return filteredByCategory.filter((p) => {
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    });
  }, [filteredByCategory, minPrice, maxPrice]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredByPrice];
    if (sortBy === 'price-low') {
      return arr.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return arr.sort((a, b) => b.price - a.price);
    }
    return arr;
  }, [filteredByPrice, sortBy]);

  // --- Render Items ---
  const renderGridItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: theme.surface }]}
      onPress={() => router.push(`/(app)/product-detail?id=${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <Text numberOfLines={1} style={[styles.gridName, { color: theme.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.gridPrice, { color: theme.text }]}>
          ₦{item.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: theme.surface, borderColor: theme.secondaryBackground }]}
      onPress={() => router.push(`/(app)/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.images[0] }} style={styles.listImage} />
      <View style={styles.listContent}>
        <View>
            <Text numberOfLines={2} style={[styles.listName, { color: theme.text }]}>
            {item.title}
            </Text>
            {item.description && (
            <Text numberOfLines={1} style={[styles.listDescription, { color: theme.secondaryText }]}>
                {item.description}
            </Text>
            )}
        </View>
        <Text style={[styles.listPrice, { color: theme.text }]}>
          ₦{item.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
            
            <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.text }]}>
                {subcategory ? String(subcategory) : categoryId ? String(categoryId) : 'Products'}
            </Text>
            
            <View style={[styles.viewToggle, { backgroundColor: theme.secondaryBackground }]}>
                <TouchableOpacity
                    style={[styles.viewBtn, viewMode === 'grid' && { backgroundColor: theme.surface, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 }]}
                    onPress={() => setViewMode('grid')}
                >
                    <Grid size={18} color={viewMode === 'grid' ? theme.primary : theme.mutedText} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.viewBtn, viewMode === 'list' && { backgroundColor: theme.surface, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 }]}
                    onPress={() => setViewMode('list')}
                >
                    <List size={18} color={viewMode === 'list' ? theme.primary : theme.mutedText} strokeWidth={2} />
                </TouchableOpacity>
            </View>
        </View>
      </View>

      {/* Results Header */}
      <View style={[styles.resultsHeader, { backgroundColor: theme.background }]}>
         <Text style={[styles.resultCount, { color: theme.mutedText }]}>
            {sortedProducts.length} items found
         </Text>
      </View>

      {/* Product List */}
      {sortedProducts.length > 0 ? (
        <FlatList
          key={viewMode}
          data={sortedProducts}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? COLUMN_COUNT : 1}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={viewMode === 'grid' ? { gap: GAP } : undefined}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <PackageSearch size={64} color={theme.secondaryBackground} />
          <Text style={[styles.emptyText, { color: theme.text }]}>No products found</Text>
          <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
            Try adjusting your search or filters.
          </Text>
        </View>
      )}

      {/* Floating Filter Bar */}
      <View style={[styles.floatingBarContainer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.floatingBar, { backgroundColor: '#0F172A' }]}>
            <TouchableOpacity 
                style={styles.floatBtn}
                onPress={() => {
                   router.push({
                      pathname: '/(app)/modal',
                      params: { minPrice, maxPrice }
                   });
                }}
            >
                <Filter size={18} color="white" />
                <Text style={[styles.floatBtnText, { color: 'white' }]}>Filter</Text>
            </TouchableOpacity>
            
            <View style={[styles.verticalDivider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            
            <TouchableOpacity 
                style={styles.floatBtn}
                onPress={() => {
                    const order: SortKey[] = ['default', 'price-low', 'price-high'];
                    const idx = order.indexOf(sortBy);
                    setSortBy(order[(idx + 1) % order.length]);
                }}
            >
                <SlidersHorizontal size={18} color="white" />
                <Text style={[styles.floatBtnText, { color: 'white' }]}>
                    {sortBy === 'default' ? 'Sort' : sortBy === 'price-low' ? 'Low to High' : 'High to Low'}
                </Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    textTransform: 'capitalize',
  },
  
  // View Toggle
  viewToggle: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 8,
    gap: 2,
  },
  viewBtn: {
    padding: 6,
    borderRadius: 6,
  },

  // Search
  searchContainer: { paddingHorizontal: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // List Container
  listContainer: {
    paddingHorizontal: PADDING,
    paddingBottom: 100, // Space for floating bar
  },

  // Grid Items
  gridItem: {
    width: ITEM_WIDTH,
    marginBottom: GAP,
    borderRadius: 12,
    overflow: 'hidden',
    // Minimal shadow
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  gridImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
  },
  gridContent: {
    padding: 10,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  gridPrice: {
    fontSize: 15,
    fontWeight: '700',
  },

  // List Items
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 10,
  },
  listImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  listPrice: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 15,
    marginTop: 8,
  },

  // Floating Bar
  floatingBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  floatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  floatBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    height: 20,
  },
});