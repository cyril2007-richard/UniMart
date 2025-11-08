
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Grid, List, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View, Dimensions } from 'react-native';
import Colors from '../constants/Colors';
import { products } from '../constants/mockData';

const { width } = Dimensions.get('window');
const PADDING = 20;
const SPACING = 6;
const NUM_COLUMNS = 3;
const ITEM_WIDTH = (width - (PADDING * 2) - (SPACING * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

export default function ProductScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { categoryId, subcategory } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');

  let filteredProducts = products.filter(p => {
    if (categoryId && subcategory) {
      return p.category === categoryId && p.subcategory === subcategory;
    } else if (categoryId) {
      return p.category === categoryId;
    } else { 
      return true;
    }
  });

  // Search filter
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort products
  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  }

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.gridCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]} 
      onPress={() => router.push(`/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <Text style={[styles.gridName, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.gridPrice, { color: theme.purple }]}>
          ₦{item.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.listCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]} 
      onPress={() => router.push(`/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.listImage} />
      <View style={styles.listContent}>
        <Text style={[styles.listName, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.listPrice, { color: theme.purple }]}>
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7' }]}>
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

      {/* Filter and View Controls */}
      <View style={styles.controlsSection}>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7' }]}
          onPress={() => {
            const sorts = ['default', 'price-low', 'price-high', 'name'] as const;
            const currentIndex = sorts.indexOf(sortBy);
            const nextIndex = (currentIndex + 1) % sorts.length;
            setSortBy(sorts[nextIndex]);
          }}
        >
          <SlidersHorizontal color={theme.text} size={18} strokeWidth={2} />
          <Text style={[styles.filterText, { color: theme.text }]}>
            {sortBy === 'default' ? 'Sort' : sortBy === 'price-low' ? 'Price: Low' : sortBy === 'price-high' ? 'Price: High' : 'A-Z'}
          </Text>
        </TouchableOpacity>

        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7' }]}
            onPress={() => setViewMode('grid')}
          >
            <Grid color={viewMode === 'grid' ? theme.purple : theme.tabIconDefault} size={18} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7' }]}
            onPress={() => setViewMode('list')}
          >
            <List color={viewMode === 'list' ? theme.purple : theme.tabIconDefault} size={18} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsSection}>
        <Text style={[styles.resultsText, { color: theme.tabIconDefault }]}>
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
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>
            No products found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.tabIconDefault }]}>
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
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    padding: 10,
    borderRadius: 10,
  },
  viewButtonActive: {
    borderWidth: 1,
    borderColor: '#6200ea',
  },
  resultsSection: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gridCard: {
    width: ITEM_WIDTH,
    margin: SPACING / 2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gridImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  gridContent: {
    padding: 12,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  listCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  listContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  listPrice: {
    fontSize: 18,
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
});