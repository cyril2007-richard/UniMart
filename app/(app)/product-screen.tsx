import { useLocalSearchParams, useRouter } from 'expo-router';
import { Grid, List, Search, SlidersHorizontal, Filter } from 'lucide-react-native';
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
} from 'react-native';
import Colors from '../../constants/Colors';
import type { Listing } from '../../contexts/ListingsContext';
import { useListings } from '../../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const PADDING = 24;
const SPACING = 16;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - PADDING * 2 - SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type SortKey = 'default' | 'price-low' | 'price-high';

export default function ProductScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const { listings } = useListings();
  const { categoryId, subcategory, minPrice, maxPrice } = useLocalSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('default');

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

  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return filteredByPrice;
    const q = searchQuery.toLowerCase();
    return filteredByPrice.filter((p) => p.title.toLowerCase().includes(q));
  }, [filteredByPrice, searchQuery]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredBySearch];
    if (sortBy === 'price-low') {
      return arr.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return arr.sort((a, b) => b.price - a.price);
    }
    return arr;
  }, [filteredBySearch, sortBy]);

  const renderGridItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => router.push(`/(app)/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <Text style={[styles.gridName, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.gridPrice, { color: theme.purple }]}>
          ₦{item.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={[styles.listItem, { borderBottomColor: theme.surface }]}
      onPress={() => router.push(`/(app)/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.images[0] }} style={styles.listImage} />
      <View style={styles.listContent}>
        <Text style={[styles.listName, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.listPrice, { color: theme.purple }]}>
          ₦{item.price.toLocaleString()}
        </Text>
        {item.description && (
          <Text style={[styles.listDescription, { color: theme.secondaryText }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {subcategory ? String(subcategory) : categoryId ? String(categoryId) : 'All Products'}
        </Text>
        <View style={[styles.viewToggle, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'grid' && { backgroundColor: theme.background }]}
            onPress={() => setViewMode('grid')}
          >
            <Grid color={viewMode === 'grid' ? theme.purple : theme.secondaryText} size={18} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'list' && { backgroundColor: theme.background }]}
            onPress={() => setViewMode('list')}
          >
            <List color={viewMode === 'list' ? theme.purple : theme.secondaryText} size={18} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Search color={theme.secondaryText} size={20} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search products..."
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.resultsSection}>
        <Text style={[styles.resultsText, { color: theme.secondaryText }]}>
          {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
        </Text>
      </View>

      {sortedProducts.length > 0 ? (
        <FlatList
          data={sortedProducts}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? NUM_COLUMNS : 1}
          key={viewMode}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between' } : undefined}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>No products found</Text>
          <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
            Try adjusting your search or filters.
          </Text>
        </View>
      )}
      
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: theme.purple }]}
          onPress={() => {
            router.push({
                pathname: '/(app)/modal',
                params: {
                    minPrice: minPrice,
                    maxPrice: maxPrice
                }
            });
          }}
        >
          <Filter color={'white'} size={18} strokeWidth={2} />
          <Text style={[styles.filterText, { color: 'white' }]}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.floatingButton, { backgroundColor: theme.purple }]}
            onPress={() => {
                const order: SortKey[] = ['default', 'price-low', 'price-high'];
                const idx = order.indexOf(sortBy);
                setSortBy(order[(idx + 1) % order.length]);
            }}
        >
            <SlidersHorizontal color={'white'} size={18} strokeWidth={2} />
            <Text style={[styles.filterText, { color: 'white' }]}>
                {sortBy === 'default'
                ? 'Sort'
                : sortBy === 'price-low'
                ? 'Price: Low'
                : 'Price: High'}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: PADDING,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  searchSection: {
    paddingHorizontal: PADDING,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 12 },
  filterText: { fontSize: 14, fontWeight: '600' },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  viewButton: {
    padding: 6,
    borderRadius: 8,
  },
  resultsSection: {
    paddingHorizontal: PADDING,
    paddingBottom: 12,
    paddingTop: 16,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingHorizontal: PADDING,
    paddingBottom: 80, // Added padding to avoid overlap with floating button
  },
  gridItem: {
    width: ITEM_WIDTH,
    marginBottom: SPACING,
  },
  gridImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
  },
  gridContent: { paddingVertical: 8 },
  gridName: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 4,
  },
  gridPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  listImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 10,
    backgroundColor: Colors.light.surface,
  },
  listContent: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  listName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  listPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  listDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});