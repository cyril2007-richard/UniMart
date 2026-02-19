import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Search, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useCategories } from '../../contexts/CategoryContext';
import { useListings, type Listing } from '../../contexts/ListingsContext';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const { listings } = useListings();
  const { categories } = useCategories();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // --- Search Logic ---
  const filteredListings = useMemo(() => {
    return listings.filter((listing: Listing) => {
      const matchesSearch = searchQuery
        ? listing.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory === 'all' || listing.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchQuery, selectedCategory]);

  // --- Render Items ---
  const renderCategoryChip = ({ item }: { item: any }) => {
    const isActive = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[
            styles.categoryChip,
            isActive ? { backgroundColor: theme.text } : { backgroundColor: theme.surface }
        ]}
        onPress={() => setSelectedCategory(item.id)}
      >
        <Text style={[
            styles.categoryChipText,
            isActive ? { color: theme.background } : { color: theme.text }
        ]}>
            {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListingItem = ({ item }: { item: Listing }) => {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150';
    
    return (
      <TouchableOpacity
        style={[styles.resultCard, { backgroundColor: theme.surface }]}
        onPress={() => router.push(`/product-detail?id=${item.id}`)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={styles.resultImage} />
        
        <View style={styles.resultInfo}>
            <View>
                <Text numberOfLines={1} style={[styles.resultTitle, { color: theme.text }]}>
                    {item.title}
                </Text>
                <Text style={[styles.resultCategory, { color: theme.secondaryText }]}>
                    {item.subcategory || 'General'}
                </Text>
            </View>
            <Text style={[styles.resultPrice, { color: theme.text }]}>
                ₦{item.price.toLocaleString()}
            </Text>
        </View>
        
        <View style={styles.chevronContainer}>
            <ChevronRight size={18} color={theme.mutedText} />
        </View>
      </TouchableOpacity>
    );
  };

  // Combine 'All' with fetched categories for the list
  const categoryList = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* KeyboardAvoidingView fixes the iOS issue where the keyboard 
         covers the bottom of the list or pushes content up incorrectly.
      */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        {/* Header & Search Bar */}
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <View style={styles.searchRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                
                <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                    <Search size={20} color={theme.secondaryText} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search products..."
                        placeholderTextColor={theme.secondaryText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={Keyboard.dismiss}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <X size={16} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category Filter List */}
            <View style={styles.filterContainer}>
                <FlatList
                    data={categoryList}
                    renderItem={renderCategoryChip}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryListContent}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="handled"
                />
            </View>
        </View>

        {/* Results */}
        <View style={styles.contentContainer}>
            {filteredListings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
                        <Search size={40} color={theme.secondaryText} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No products found</Text>
                    <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
                        Try adjusting your search or category filter.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredListings}
                    renderItem={renderListingItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    ListHeaderComponent={
                        <Text style={[styles.resultsCount, { color: theme.secondaryText }]}>
                            {filteredListings.length} results found
                        </Text>
                    }
                />
            )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  headerContainer: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'white', // Ensure header background
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: { marginRight: 12 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    padding: 2,
    marginLeft: 8,
  },

  // Filters
  filterContainer: {
    paddingBottom: 4,
  },
  categoryListContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Content
  contentContainer: { flex: 1 },
  resultsList: {
    padding: 16,
    paddingTop: 8,
  },
  resultsCount: {
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
  },

  // Cards
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  resultImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    gap: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultCategory: {
    fontSize: 13,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  chevronContainer: {
    padding: 8,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});