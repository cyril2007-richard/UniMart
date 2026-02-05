import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Grid, List, LogIn, Settings, Trash2, BadgeCheck } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useListings } from '../../../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2; // Tighter gap for a mosaic look
const PADDING = 0; // Edge-to-edge grid
const IMAGE_SIZE = (width - (COLUMN_COUNT - 1) * GAP) / COLUMN_COUNT;

export default function ProfileScreen() {
  const theme = Colors.light;
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('grid');
  const { currentUser, updateProfile } = useAuth();
  const { listings, deleteListing } = useListings();
  const router = useRouter();
  
  // State
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

  // --- Auth Guard ---
  if (!currentUser) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <View style={styles.loginCard}>
          <View style={[styles.iconCircle, { backgroundColor: theme.lightPurple }]}>
            <LogIn size={40} color={theme.purple} />
          </View>
          <Text style={[styles.loginTitle, { color: theme.text }]}>Welcome to UniMart</Text>
          <Text style={[styles.loginSubtitle, { color: theme.secondaryText }]}>
            Log in to manage your listings and view your profile.
          </Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: theme.purple }]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login or Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Handlers ---
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
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
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(listingId) },
      ]
    );
  };

  const confirmDelete = async (listingId: string) => {
    setIsDeleting(true);
    try {
      await deleteListing(listingId);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete listing.');
    }
    setIsDeleting(false);
  };

  // --- Render Items ---
  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, marginBottom: GAP }}
      onPress={() => router.push(`/(app)/product-detail?id=${item.id}`)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
      {isEditing && (
        <TouchableOpacity style={styles.deleteOverlay} onPress={() => handleDeletePress(item.id)}>
          <Trash2 color="white" size={16} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      style={[styles.listItem, { backgroundColor: theme.background }]} 
      onPress={() => router.push(`/(app)/product-detail?id=${item.id}`)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.listImage} />
      <View style={styles.listContent}>
        <View>
          <Text numberOfLines={1} style={[styles.listTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.listPrice, { color: theme.purple }]}>₦{Number(item.price).toLocaleString()}</Text>
        </View>
        <View style={styles.listMeta}>
          <Text style={[styles.listDate, { color: theme.secondaryText }]}>Posted recently</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.listDeleteBtn} onPress={() => handleDeletePress(item.id)}>
        <Trash2 color={theme.purple} size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>{currentUser.username}</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/(app)/settings')}>
          <Settings color={theme.text} size={24} strokeWidth={1.5}/>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userListings}
        key={activeTab} // Force re-render when tab changes
        numColumns={activeTab === 'grid' ? COLUMN_COUNT : 1}
        renderItem={activeTab === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={activeTab === 'grid' ? { gap: GAP } : undefined}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Profile Info Section */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: newProfilePicture || 'https://via.placeholder.com/150' }}
                  style={styles.avatar}
                />
                {isEditing && (
                  <TouchableOpacity style={[styles.editBadge, { backgroundColor: theme.purple }]} onPress={pickImage}>
                    <Camera size={14} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.infoContainer}>
                {isEditing ? (
                  <TextInput
                    style={[styles.editInput, { color: theme.text, borderColor: theme.surface }]}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholder="Username"
                    autoCapitalize="none"
                  />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.nameText, { color: theme.text, marginBottom: 0 }]}>{currentUser.name}</Text>
                    {currentUser.isVerified && <BadgeCheck size={20} color={theme.purple} fill={theme.lightPurple || '#F3E8FF'} />}
                  </View>
                )}
                
                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{userListings.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Posts</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.surface }]} />
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{currentUser.followers || 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Followers</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.surface }]} />
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{currentUser.following || 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Following</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              {isEditing ? (
                <View style={styles.editActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.cancelBtn, { borderColor: theme.secondaryText }]} 
                    onPress={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    <Text style={[styles.btnLabel, { color: theme.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.purple, flex: 1 }]} 
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="white" size="small"/>
                    ) : (
                      <Text style={[styles.btnLabel, { color: 'white' }]}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.editProfileBtn, { backgroundColor: theme.surface }]} 
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={[styles.btnLabel, { color: theme.text }]}>Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tabs */}
            <View style={[styles.tabBar, { borderTopColor: theme.surface, borderBottomColor: theme.surface }]}>
              <TouchableOpacity 
                onPress={() => setActiveTab('grid')} 
                style={[styles.tabItem, activeTab === 'grid' && { borderBottomColor: theme.text }]}
              >
                <Grid size={24} color={activeTab === 'grid' ? theme.text : theme.secondaryText} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveTab('list')} 
                style={[styles.tabItem, activeTab === 'list' && { borderBottomColor: theme.text }]}
              >
                <List size={24} color={activeTab === 'list' ? theme.text : theme.secondaryText} />
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
              <Grid size={32} color={theme.secondaryText} />
            </View>
            <Text style={[styles.emptyText, { color: theme.text }]}>No Listings Yet</Text>
            <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
              Items you list for sale will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Login State
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginCard: { width: '100%', alignItems: 'center', padding: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  loginTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  loginSubtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  loginButton: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Top Bar
  topBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 10, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.05)' },
  topBarTitle: { fontSize: 16, fontWeight: '700' },
  settingsBtn: { position: 'absolute', right: 16, bottom: 10 },

  // Profile Header
  profileHeader: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 20 },
  avatar: { width: 86, height: 86, borderRadius: 43 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, padding: 6, borderRadius: 12, borderWidth: 2, borderColor: 'white' },
  
  infoContainer: { flex: 1 },
  nameText: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  editInput: { fontSize: 18, borderBottomWidth: 1, paddingVertical: 4, marginBottom: 12 },
  
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { alignItems: 'center', paddingHorizontal: 8 },
  statVal: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 24, marginHorizontal: 4 },

  // Buttons
  actionSection: { paddingHorizontal: 20, paddingBottom: 20 },
  editActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  editProfileBtn: { width: '100%' },
  cancelBtn: { flex: 1, borderWidth: 1, backgroundColor: 'transparent' },
  btnLabel: { fontSize: 14, fontWeight: '600' },

  // Tabs
  tabBar: { flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },

  // Grid
  gridImage: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' },
  deleteOverlay: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 20 },

  // List
  listItem: { flexDirection: 'row', padding: 12, marginHorizontal: 16, marginVertical: 6, borderRadius: 12, alignItems: 'center' },
  listImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#f0f0f0' },
  listContent: { flex: 1, paddingHorizontal: 12 },
  listTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  listPrice: { fontSize: 15, fontWeight: '700' },
  listMeta: { flexDirection: 'row', marginTop: 4 },
  listDate: { fontSize: 12 },
  listDeleteBtn: { padding: 8 },

  // Empty State
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySub: { fontSize: 14, maxWidth: 200, textAlign: 'center' },
});