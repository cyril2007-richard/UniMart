// app/product-screen.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Grid, List, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Colors from '../constants/Colors';
import type { Listing } from '../contexts/ListingsContext'; // <-- import the type
import { useListings } from '../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const PADDING = 20;
const SPACING = 12;
const NUM_COLUMNS = 2;
const ITEM_WIDTH =
  (width - PADDING * 2 - SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type SortKey = 'default' | 'price-low' | 'price-high';

export default function ProductScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors.light;
  const router = useRouter();
  const { listings } = useListings();
  const { categoryId, subcategory } = useLocalSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('default');

  // --------------------------------------------------------------
  // 1. Filter by category / subcategory
  // --------------------------------------------------------------
  const filteredByCategory = useMemo(() => {
    return listings.filter((p) => {
      if (categoryId && subcategory) {
        return p.category === categoryId && p.subcategory === subcategory;
      }
      if (categoryId) return p.category === categoryId;
      return true;
    });
  }, [listings, categoryId, subcategory]);

  // --------------------------------------------------------------
  // 2. Search
  // --------------------------------------------------------------
  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return filteredByCategory;
    const q = searchQuery.toLowerCase();
    return filteredByCategory.filter((p) =>
      p.title.toLowerCase().includes(q)
    );
  }, [filteredByCategory, searchQuery]);

  // --------------------------------------------------------------
  // 3. Sort
  // --------------------------------------------------------------
  const sortedProducts = useMemo(() => {
    const arr = [...filteredBySearch];
    if (sortBy === 'price-low') {
      return arr.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return arr.sort((a, b) => b.price - a.price);
    }
    return arr; // default
  }, [filteredBySearch, sortBy]);

  // --------------------------------------------------------------
  // Renderers
  // --------------------------------------------------------------
  const renderGridItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={[styles.gridCard, { backgroundColor: theme.background, borderColor: theme.tabIconDefault }]}
      onPress={() => router.push(`/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <Text style={[styles.gridName, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.gridPrice, { color: theme.tint }]}>
          ₦{item.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={[styles.listCard, { backgroundColor: theme.background, borderColor: theme.tabIconDefault }]}
      onPress={() => router.push(`/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.images[0] }} style={styles.listImage} />
      <View style={styles.listContent}>
        <Text style={[styles.listName, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.listPrice, { color: theme.tint }]}>
          ₦{item.price.toLocaleString()}
        </Text>
        {item.description && (
          <Text style={[styles.listDescription, { color: theme.tabIconDefault }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // --------------------------------------------------------------
  // UI
  // --------------------------------------------------------------
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {subcategory
            ? String(subcategory)
            : categoryId
            ? String(categoryId)
            : 'All Products'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.lightPurple }]}>
          <Search color={theme.tabIconDefault} size={20} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search products..."
            placeholderTextColor={theme.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter & View Controls */}
      <View style={styles.controlsSection}>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.lightPurple }]}
          onPress={() => {
            const order: SortKey[] = ['default', 'price-low', 'price-high'];
            const idx = order.indexOf(sortBy);
            setSortBy(order[(idx + 1) % order.length]);
          }}
        >
          <SlidersHorizontal color={theme.text} size={18} strokeWidth={2} />
          <Text style={[styles.filterText, { color: theme.text }]}>
            {sortBy === 'default'
              ? 'Sort'
              : sortBy === 'price-low'
              ? 'Price: Low'
              : 'Price: High'}
          </Text>
        </TouchableOpacity>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              { backgroundColor: theme.lightPurple },
              viewMode === 'grid' && { backgroundColor: theme.lightPurple, borderWidth: 1.5, borderColor: theme.tint },
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Grid
              color={viewMode === 'grid' ? theme.tint : theme.tabIconDefault}
              size={18}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewButton,
              { backgroundColor: theme.lightPurple },
              viewMode === 'list' && { backgroundColor: theme.lightPurple, borderWidth: 1.5, borderColor: theme.tint },
            ]}
            onPress={() => setViewMode('list')}
          >
            <List
              color={viewMode === 'list' ? theme.tint : theme.tabIconDefault}
              size={18}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsSection}>
        <Text style={[styles.resultsText, { color: theme.tabIconDefault }]}>
          {sortedProducts.length}{' '}
          {sortedProducts.length === 1 ? 'product' : 'products'}
        </Text>
      </View>

      {/* Products List */}
      {sortedProducts.length > 0 ? (
        <FlatList
          data={sortedProducts}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? NUM_COLUMNS : 1}
          key={viewMode}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>No products found</Text>
          <Text style={[styles.emptySubtext, { color: theme.tabIconDefault }]}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </View>
  );
}

/* --------------------------------------------------------------
   Styles – unchanged (kept exactly as you had them)
   -------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  searchSection: { paddingHorizontal: 20, paddingBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 12 },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  filterText: { fontSize: 14, fontWeight: '600' },
  viewToggle: { flexDirection: 'row', gap: 8 },
  viewButton: {
    padding: 10,
    borderRadius: 10,
  },
  viewButtonActive: {
  },
  resultsSection: { paddingHorizontal: 20, paddingBottom: 12 },
  resultsText: { fontSize: 13, fontWeight: '500' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: SPACING },

  /* Grid Card */
  gridCard: {
    width: ITEM_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridImage: { width: '100%', height: 160, resizeMode: 'cover' },
  gridContent: { padding: 14 },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 19,
  },
  gridPrice: { fontSize: 17, fontWeight: '700' },

  /* List Card */
  listCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listImage: { width: 130, height: 130, resizeMode: 'cover' },
  listContent: { flex: 1, padding: 14, justifyContent: 'center' },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 21,
  },
  listPrice: { fontSize: 19, fontWeight: '700', marginBottom: 8 },
  listDescription: { fontSize: 13, lineHeight: 18 },

  /* Empty State */
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
});