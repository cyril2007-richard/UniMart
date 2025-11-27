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
import Colors from '../../constants/Colors';
import mockData from '../../constants/mockData';
import { useListings, type Listing } from '../../contexts/ListingsContext';

export default function SearchScreen() {
  const { listings } = useListings();
  const router = useRouter();
  const theme = Colors.light;

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
      <Text style={[styles.listingTitle, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.listingPrice, { color: theme.secondaryText }]}>₦{item.price.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Input */}
      <TextInput
        style={[styles.searchInput, { borderColor: theme.tabIconDefault, color: theme.text }]}
        placeholder="Search products..."
        placeholderTextColor={theme.tabIconDefault}
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
            selectedCategory === 'all' ? { backgroundColor: theme.purple } : { backgroundColor: theme.surface },
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === 'all' ? { color: theme.white, fontWeight: '600' } : { color: theme.secondaryText },
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
              selectedCategory === cat.id ? { backgroundColor: theme.purple } : { backgroundColor: theme.surface },
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id ? { color: theme.white, fontWeight: '600' } : { color: theme.secondaryText },
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
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No products found</Text>
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
  },
  searchInput: {
    height: 48,
    borderBottomWidth: 1,
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
  },
  categoryText: {
    fontSize: 14,
  },
  resultsList: {
    paddingBottom: 20,
  },
  listingItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: Colors.light.surface,
  },
  listingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
  },
  emptyText: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 16,
  },
});
