import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Grid, Package } from "lucide-react-native"; // Modern Icons
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../../constants/Colors";
import { useCategories } from "../../../contexts/CategoryContext";

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.28;

export default function ShopScreen() {
  const theme = Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, loading } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Initial Selection
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  
  // Subcategories
  const displaySubcategories = currentCategory ? currentCategory.subcategories : [];

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const renderSidebarItem = ({ item }: { item: any }) => {
    const isSelected = item.id === selectedCategory;
    return (
      <TouchableOpacity
        onPress={() => setSelectedCategory(item.id)}
        style={[
          styles.sidebarItem,
          isSelected && { backgroundColor: theme.background }
        ]}
        activeOpacity={0.8}
      >
        <Text
          numberOfLines={2}
          style={[
            styles.sidebarText,
            { color: isSelected ? theme.primary : theme.secondaryText, fontWeight: isSelected ? '700' : '500' }
          ]}
        >
          {item.name}
        </Text>
        {isSelected && <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />}
      </TouchableOpacity>
    );
  };

  const renderSubcategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      activeOpacity={0.7}
      onPress={() => router.push(`/product-screen?categoryId=${selectedCategory}&subcategory=${encodeURIComponent(item)}`)}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#fff', borderRadius: 0 }]} />
      <Text numberOfLines={2} style={[styles.gridText, { color: theme.text }]}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <View style={styles.headerTopRow}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/announcement')} style={styles.bellBtn}>
                <Ionicons name="notifications-outline" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Split View */}
      <View style={styles.contentContainer}>
        
        {/* Sidebar (Left) */}
        <View style={[styles.sidebar, { backgroundColor: theme.surface }]}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderSidebarItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sidebarContent}
                style={{ flex: 1 }}
            />
        </View>

        {/* Subcategories (Right) */}
        <View style={[styles.mainArea, { backgroundColor: theme.background }]}>
            {currentCategory ? (
                <FlatList
                    data={displaySubcategories}
                    keyExtractor={(item, index) => `${selectedCategory}-${index}`}
                    numColumns={3}
                    columnWrapperStyle={styles.gridRow}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.gridContent}
                    style={{ flex: 1 }}
                    ListHeaderComponent={
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>{currentCategory.name}</Text>
                            <Text style={[styles.itemCount, { color: theme.secondaryText }]}>
                                {displaySubcategories.length} items
                            </Text>
                        </View>
                    }
                    renderItem={renderSubcategoryItem}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Grid color={theme.secondaryText} size={40} />
                            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No items found</Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.emptyState}>
                    <Grid color={theme.secondaryText} size={40} />
                    <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No categories found</Text>
                </View>
            )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  header: { 
    paddingHorizontal: 16, 
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  bellBtn: { padding: 4 },

  // Content Layout
  contentContainer: { flex: 1, flexDirection: 'row' },
  
  // Sidebar
  sidebar: { width: SIDEBAR_WIDTH },
  sidebarContent: { paddingBottom: 40 },
  sidebarItem: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: '#fff', // Or theme.background
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  sidebarText: { fontSize: 13, fontWeight: '500' },
  sidebarTextActive: { fontWeight: '700' },

  // Main Area
  mainArea: { flex: 1 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'baseline',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  itemCount: { fontSize: 12 },
  
  gridContent: { padding: 16 },
  gridRow: { gap: 12 }, // Gap between columns
  
  gridItem: { 
    flex: 1, 
    alignItems: 'center', 
    marginBottom: 20,
    maxWidth: '33%', // Ensure 3 items per row doesn't overflow
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridText: { 
    fontSize: 12, 
    textAlign: 'center', 
    fontWeight: '500',
    paddingHorizontal: 2,
  },

  // Empty State
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 12, fontSize: 15 },
});