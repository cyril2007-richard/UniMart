
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Grid, List } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList, Dimensions, useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { users, products } from '../constants/mockData';

const { width } = Dimensions.get('window');
const imageSize = (width - 40) / 3; // (padding - gaps) / numColumns

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams();
  const seller = users.find(u => u.id === id);
  const sellerProducts = products.filter(p => p.sellerId === id);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [activeTab, setActiveTab] = useState('grid');
  const router = useRouter();

  if (!seller) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ fontSize: 16, color: theme.text }}>Seller not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.username, { color: theme.text }]}>{seller.username}</Text>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: seller.profilePicture }}
          style={styles.profilePicture}
        />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{sellerProducts.length}</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Listings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{seller.followers}</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{seller.following}</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={[styles.name, { color: theme.text }]}>{seller.name}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.purple }]}>
          <Text style={[styles.primaryButtonText, { color: theme.white }]}>Follow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.purple }]}>
          <Text style={[styles.secondaryButtonText, { color: theme.purple }]}>Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('grid')} style={[styles.tab, activeTab === 'grid' && styles.activeTab]}>
          <Grid size={24} color={activeTab === 'grid' ? theme.purple : theme.tabIconDefault} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('list')} style={[styles.tab, activeTab === 'list' && styles.activeTab]}>
          <List size={24} color={activeTab === 'list' ? theme.purple : theme.tabIconDefault} />
        </TouchableOpacity>
      </View>

      {activeTab === 'grid' ? (
        <FlatList
          data={sellerProducts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listingItem} onPress={() => router.push(`/product-detail?id=${item.id}`)}>
              <Image source={{ uri: item.image }} style={styles.listingImage} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.listingRow}
        />
      ) : (
        <View style={styles.listViewContainer}>
          <Text style={{color: theme.text}}>List view not implemented yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  bioSection: {
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  listingRow: {
    justifyContent: 'space-between',
  },
  listingItem: {
    width: imageSize,
    height: imageSize,
    marginBottom: 10,
  },
  listingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  listViewContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
});
