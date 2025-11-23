// app/search.tsx
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import mockData from '../../constants/mockData';
import { useListings, type Listing } from '../../contexts/ListingsContext';

export default function SearchScreen() {
  const { listings } = useListings();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredListings = useMemo(() => {
    return listings.filter((listing: Listing) => {
      const matchesSearch = searchQuery
        ? listing.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory === 'all' || listing.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchQuery, selectedCategory]);

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.listingItem}
      onPress={() => router.push(`/product-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <Text style={styles.listingTitle}>{item.title}</Text>
      <Text style={styles.listingPrice}>₦{item.price.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus
      />

      {/* Horizontal Category Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === 'all' && styles.categoryTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {mockData.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Listings */}
      <FlatList
        data={filteredListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 48,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    fontSize: 16,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  categoryBar: {
    flexGrow: 0,
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 6,
    backgroundColor: '#f5f5f5',
  },
  categoryButtonActive: {
    backgroundColor: '#000',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsList: {
    paddingBottom: 20,
  },
  listingItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  listingTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
});
