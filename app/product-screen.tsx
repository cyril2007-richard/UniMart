import { useLocalSearchParams, useRouter } from 'expo-router';
import { Grid, List, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useListings } from '../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const PADDING = 20;
const SPACING = 12;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - (PADDING * 2) - (SPACING * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

export default function ProductScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const { listings } = useListings();
  const { categoryId, subcategory } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');

  const filteredProducts = useMemo(() => {
    let products = listings;

    if (categoryId && subcategory) {
      products = products.filter(p => p.category === categoryId && p.subcategory === subcategory);
    } else if (categoryId) {
      products = products.filter(p => p.category === categoryId);
    }

    if (searchQuery) {
      products = products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'price-low') {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      products = [...products].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'title') {
      products = [...products].sort((a, b) => a.title.localeCompare(b.title));
    }

    return products;
  }, [listings, categoryId, subcategory, searchQuery, sortBy]);

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.gridCard} 
      onPress={() => router.push(`/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <Text style={styles.gridName} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.gridPrice}>
          ₦{item.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.listCard} 
      onPress={() => router.push(`/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.images[0] }} style={styles.listImage} />
      <View style={styles.listContent}>
        <Text style={styles.listName} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.listPrice}>
          ₦{item.price.toLocaleString()}
        </Text>
        {item.description && (
          <Text style={styles.listDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {subcategory ? String(subcategory) : categoryId ? String(categoryId) : 'All Products'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search color="#8e8e93" size={20} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#8e8e93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter and View Controls */}
      <View style={styles.controlsSection}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {
            const sorts = ['default', 'price-low', 'price-high', 'title'] as const;
            const currentIndex = sorts.indexOf(sortBy);
            const nextIndex = (currentIndex + 1) % sorts.length;
            setSortBy(sorts[nextIndex]);
          }}
        >
          <SlidersHorizontal color="#000" size={18} strokeWidth={2} />
          <Text style={styles.filterText}>
            {sortBy === 'default' ? 'Sort' : sortBy === 'price-low' ? 'Price: Low' : sortBy === 'price-high' ? 'Price: High' : 'A-Z'}
          </Text>
        </TouchableOpacity>

        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Grid color={viewMode === 'grid' ? '#6200ea' : '#8e8e93'} size={18} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List color={viewMode === 'list' ? '#6200ea' : '#8e8e93'} size={18} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsSection}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </Text>
      </View>

      {/* Products List */}
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
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
          <Text style={styles.emptyText}>
            No products found
          </Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    textTransform: 'capitalize',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
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
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    padding: 10,
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
  },
  viewButtonActive: {
    backgroundColor: '#f0e6ff',
    borderWidth: 1.5,
    borderColor: '#6200ea',
  },
  resultsSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8e8e93',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  gridCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
    backgroundColor: '#f5f5f7',
  },
  gridContent: {
    padding: 14,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 19,
  },
  gridPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6200ea',
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listImage: {
    width: 130,
    height: 130,
    resizeMode: 'cover',
    backgroundColor: '#f5f5f7',
  },
  listContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 21,
  },
  listPrice: {
    fontSize: 19,
    fontWeight: '700',
    color: '#6200ea',
    marginBottom: 8,
  },
  listDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#8e8e93',
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
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#8e8e93',
  },
});