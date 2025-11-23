// src/screens/ShopScreen.tsx
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  ActivityIndicator,
} from "react-native";
import Colors from "../../../constants/Colors";
import { useCategories } from "../../../contexts/CategoryContext";

export default function ShopScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors.light;
  const router = useRouter();
  const { categories, loading } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
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
              backgroundColor: "#fff",
              borderColor: isFocused ? theme.purple : "#ddd",
              borderWidth: 1.5,
            },
          ]}
        >
          <TouchableOpacity>
            <Feather name="camera" size={20} color={theme.tint} style={styles.iconLeft} />
          </TouchableOpacity>

          <TextInput
            placeholder="Search for items..."
            placeholderTextColor="#888"
            style={[styles.searchInput, { color: theme.text }]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <TouchableOpacity>
            <Feather name="search" size={20} color={theme.tint} style={styles.iconRight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bellIcon} onPress={() => router.push('/announcement')}>
          <Ionicons name="notifications-outline" size={24} color={theme.tint} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 🏬 Shop Layout */}
      <View style={styles.shopContainer}>
        {/* Sidebar Categories */}
        <View style={[styles.sidebar, { backgroundColor: theme.white }]}>
          <FlatList
            data={categories}
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
                      backgroundColor: isSelected ? "#f8f8f8" : "transparent", // off-white highlight
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
            data={currentCategory?.subcategories || []}
            keyExtractor={(item, index) => `${selectedCategory}-${index}`}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.subcategoryCard}
                onPress={() => router.push(`/product-screen?categoryId=${selectedCategory}&subcategory=${encodeURIComponent(item)}`)}>
                <View style={styles.placeholderBox} />
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
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1.5,
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
    backgroundColor: "#ffffffff",
    marginVertical: 10,
  },
  shopContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: "23%",
    borderRightWidth: 1,
    borderRightColor: "#eee",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 6,
  },
  subcategoryText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});

