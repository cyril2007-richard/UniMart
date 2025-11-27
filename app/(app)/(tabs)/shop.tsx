// src/screens/ShopScreen.tsx
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Colors from "../../../constants/Colors";
import { useCategories } from "../../../contexts/CategoryContext";

export default function ShopScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const { categories, loading } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const lowerQuery = searchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(lowerQuery) || 
      cat.subcategories.some(sub => sub.toLowerCase().includes(lowerQuery))
    );
  }, [categories, searchQuery]);

  useEffect(() => {
    if (filteredCategories.length > 0) {
        // If the currently selected category is no longer in the filtered list, select the first one from the filtered list
        const exists = filteredCategories.find(c => c.id === selectedCategory);
        if (!exists) {
            setSelectedCategory(filteredCategories[0].id);
        }
    }
  }, [filteredCategories, selectedCategory]);

  const currentCategory = filteredCategories.find((c) => c.id === selectedCategory);
  // Filter displayed subcategories based on search query as well
  const displaySubcategories = currentCategory 
    ? currentCategory.subcategories.filter(sub => !searchQuery || sub.toLowerCase().includes(searchQuery.toLowerCase()) || currentCategory.name.toLowerCase().includes(searchQuery.toLowerCase())) 
    : [];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.purple} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 🔍 Search Bar Section */}
      <View style={styles.headerContainer}>
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: theme.background,
              borderColor: isFocused ? theme.purple : theme.tabIconDefault,
              borderWidth: 1.5,
            },
          ]}
        >
          <TextInput
            placeholder="Search categories..."
            placeholderTextColor={theme.tabIconDefault}
            style={[styles.searchInput, { color: theme.text }]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <TouchableOpacity>
            <Feather name="search" size={20} color={theme.tint} style={styles.iconRight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bellIcon} onPress={() => router.push('/announcement')}>
          <Ionicons name="notifications-outline" size={24} color={theme.tint} />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.surface }]} />

      {/* 🏬 Shop Layout */}
      <View style={styles.shopContainer}>
        {/* Sidebar Categories */}
        <View style={[styles.sidebar, { backgroundColor: theme.background, borderRightColor: theme.surface }]}>
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedCategory;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(item.id)}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: isSelected ? theme.surface : "transparent", // off-white highlight
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: isSelected ? "600" : "400",
                      fontSize: 13,
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Subcategories */}
        <View style={styles.subcategoriesContainer}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 10,
            }}
          >
            {currentCategory?.name}
          </Text>

          <FlatList
            data={displaySubcategories}
            keyExtractor={(item, index) => `${selectedCategory}-${index}`}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.subcategoryCard}
                onPress={() => router.push(`/product-screen?categoryId=${selectedCategory}&subcategory=${encodeURIComponent(item)}`)}>
                <View style={[styles.placeholderBox, { backgroundColor: theme.background, borderColor: theme.surface }]} />
                <Text style={[styles.subcategoryText, { color: theme.text }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  bellIcon: {
    marginLeft: 10,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  shopContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: "23%",
    borderRightWidth: 1,
    paddingVertical: 10,
  },
  categoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginVertical: 3,

  },
  subcategoriesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  subcategoryCard: {
    flex: 1 / 3,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  subcategoryText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});

