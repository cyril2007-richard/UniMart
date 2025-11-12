
import { useRouter } from 'expo-router';
import { Grid, List, MoreHorizontal, Settings } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useListings } from '../../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const imageSize = (width - 40) / 3; 

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors.light;
  const [activeTab, setActiveTab] = useState('grid');
  const { currentUser } = useAuth();
  const { listings } = useListings();
  const router = useRouter();

  if (!currentUser) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ fontSize: 16, color: theme.text }}>No user logged in.</Text>
      </View>
    );
  }

  const userListings = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return listings.filter(listing => listing.userId === currentUser.id);
  }, [listings, currentUser]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.username, { color: theme.text }]}>{currentUser.username}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
            <Settings color={theme.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MoreHorizontal color={theme.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: currentUser.profilePicture }}
          style={styles.profilePicture}
        />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{userListings.length}</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Listings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>324</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>180</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={[styles.name, { color: theme.text }]}>{currentUser.name}</Text>
        <Text style={[styles.bioText, { color: theme.tabIconDefault }]}>{currentUser.matricNumber}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.purple }]}>
          <Text style={[styles.primaryButtonText, { color: theme.white }]}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.purple }]}>
          <Text style={[styles.secondaryButtonText, { color: theme.purple }]}>Share Profile</Text>
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
          data={userListings}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listingItem} onPress={() => router.push(`/product-detail?id=${item.id}`)}>
              <Image source={{ uri: item.images[0] }} style={styles.listingImage} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.listingRow}
        />
      ) : (
        <FlatList
          data={userListings}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => router.push(`/product-detail?id=${item.id}`)}>
              <Image source={{ uri: item.images[0] }} style={styles.listImage} />
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>{item.title}</Text>
                <Text style={styles.listItemPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 5,
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
  bioText: {
    fontSize: 14,
    marginTop: 5,
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

  // ✅ ADDED missing list styles below:
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  listItemDetails: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  listItemPrice: {
    fontSize: 14,
    color: Colors.light.purple,
    fontWeight: 'bold',
  },
  listViewContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
});
