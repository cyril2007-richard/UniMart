import { Camera, Grid, List, Settings, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useListings } from '../../../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3;

export default function ProfileScreen() {
  const theme = Colors.light;
  const [activeTab, setActiveTab] = useState('grid');
  const { currentUser, updateProfile } = useAuth();
  const { listings, deleteListing } = useListings();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [newProfilePicture, setNewProfilePicture] = useState(currentUser?.profilePicture || '');
  const [isSaving, setIsSaving] = useState(false);

  const userListings = useMemo(() => {
    if (!currentUser) return [];
    return listings.filter((listing) => listing.userId === currentUser.id);
  }, [listings, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setNewUsername(currentUser.username);
      setNewProfilePicture(currentUser.profilePicture);
    }
  }, [currentUser]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewProfilePicture(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await updateProfile(currentUser.id, newUsername, newProfilePicture);
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
    setIsSaving(false);
  };

  const handleDeletePress = (listingId: string) => {
    if (isDeleting) return;
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(listingId),
        },
      ]
    );
  };

  const confirmDelete = async (listingId: string) => {
    setIsDeleting(true);
    try {
      await deleteListing(listingId);
      Alert.alert('Success', 'Listing deleted.');
    } catch (error) {
      console.error('Error deleting listing: ', error);
      Alert.alert('Error', 'Failed to delete listing.');
    }
    setIsDeleting(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'grid') {
      return (
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push(`/(app)/product-detail?id=${item.id}`)}>
          <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePress(item.id)}>
            <Trash2 color="white" size={14} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity style={[styles.listItem, { borderBottomColor: theme.surface }]} onPress={() => router.push(`/(app)/product-detail?id=${item.id}`)}>
          <Image source={{ uri: item.images[0] }} style={styles.listImage} />
          <View style={styles.listItemDetails}>
            <Text style={[styles.listItemTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.listItemPrice, { color: theme.purple }]}>${item.price}</Text>
          </View>
          <TouchableOpacity style={styles.deleteButtonList} onPress={() => handleDeletePress(item.id)}>
            <Trash2 color={theme.secondaryText} size={18} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Non-scrolling Header */}
      <View style={styles.profileHeaderContainer}>
        <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(app)/settings')}>
            <Settings color={theme.text} size={24} strokeWidth={1.5}/>
            </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
            <TouchableOpacity onPress={isEditing ? pickImage : undefined} disabled={!isEditing}>
            <Image
                source={{ uri: newProfilePicture || 'https://via.placeholder.com/90' }}
                style={styles.profilePicture}
            />
            {isEditing && (
                <View style={styles.cameraIconOverlay}>
                <Camera size={16} color="white" />
                </View>
            )}
            </TouchableOpacity>
            <View style={styles.identityContainer}>
            {isEditing ? (
                <TextInput
                style={[styles.nameInput, { color: theme.text, backgroundColor: theme.surface }]}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Username"
                />
            ) : (
                <Text style={[styles.name, { color: theme.text }]}>{currentUser?.name || 'User'}</Text>
            )}
            <Text style={[styles.username, { color: theme.secondaryText }]}>@{currentUser?.username}</Text>
            </View>
        </View>

        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{userListings.length}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Listings</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.text }]}>{currentUser?.followers || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Followers</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.text }]}>{currentUser?.following || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Following</Text>
            </View>
        </View>

        <View style={styles.buttonContainer}>
            {isEditing ? (
            <>
                <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { borderColor: theme.secondaryText }]}
                onPress={() => setIsEditing(false)}
                disabled={isSaving}
                >
                <Text style={[styles.buttonText, { color: theme.secondaryText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.button, styles.primaryButton, { backgroundColor: theme.purple }]}
                onPress={handleSave}
                disabled={isSaving}
                >
                {isSaving ? <ActivityIndicator color="white" /> : <Text style={[styles.buttonText, { color: 'white' }]}>Save</Text>}
                </TouchableOpacity>
            </>
            ) : (
            <TouchableOpacity
                style={[styles.button, styles.primaryButton, { backgroundColor: theme.purple }]}
                onPress={() => setIsEditing(true)}
            >
                <Text style={[styles.buttonText, { color: 'white' }]}>Edit Profile</Text>
            </TouchableOpacity>
            )}
        </View>

        <View style={[styles.tabsContainer, { borderBottomColor: theme.surface }]}>
            <TouchableOpacity onPress={() => setActiveTab('grid')} style={[styles.tab, activeTab === 'grid' && styles.activeTab, {borderColor: theme.purple}]}>
            <Grid size={22} color={activeTab === 'grid' ? theme.purple : theme.secondaryText} strokeWidth={2}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('list')} style={[styles.tab, activeTab === 'list' && styles.activeTab, {borderColor: theme.purple}]}>
            <List size={22} color={activeTab === 'list' ? theme.purple : theme.secondaryText} strokeWidth={2}/>
            </TouchableOpacity>
        </View>
      </View>

      {/* Scrolling List */}
      <FlatList
        data={userListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={activeTab === 'grid' ? 3 : 1}
        key={activeTab}
        contentContainerStyle={styles.listContentContainer}
        columnWrapperStyle={activeTab === 'grid' ? { gap: 12, paddingHorizontal: 12 } : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.secondaryText, marginTop: 40 }}>You haven't listed any items yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeaderContainer: {
    paddingBottom: 0,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  iconButton: {
    padding: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  profilePicture: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eee',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.light.purple,
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  identityContainer: {
    marginLeft: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 150,
  },
  username: {
    fontSize: 15,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 1.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    borderRadius: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 24,
    borderBottomWidth: 1,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  listItemDetails: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  listItemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonList: {
    padding: 8,
  },
});