import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, ChevronDown, ChevronRight, UploadCloud, X, XCircle, BadgeCheck } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { Category, useCategories } from '../../contexts/CategoryContext';
import { useListings } from '../../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 20;
const IMAGE_SIZE = (width - (PADDING * 2) - (GAP * 2)) / 3;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_MB = 5;

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addListing } = useListings();
  const { currentUser } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const theme = Colors.light;

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [catModal, setCatModal] = useState(false);
  const [subModal, setSubModal] = useState(false);

  useEffect(() => {
    if (categories.length && !category) {
      const first = categories[0];
      setCategory(first);
      setSubcategory(first.subcategories[0] ?? '');
    }
  }, [categories]);

  const isValid = useMemo(() => {
    const priceNum = parseFloat(price);
    return (
      title.trim().length >= 3 &&
      priceNum > 0 &&
      description.trim().length >= 10 &&
      images.length > 0 &&
      category !== null &&
      subcategory !== ''
    );
  }, [title, price, description, images.length, category, subcategory]);

  const pickImages = useCallback(async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit Reached', `You can upload a maximum of ${MAX_IMAGES} photos.`);
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      selectionLimit: MAX_IMAGES - images.length,
    });
    if (res.canceled || !res.assets) return;

    const valid = res.assets
      .filter((a): a is NonNullable<typeof a> => !!a.uri && !!a.fileSize)
      .filter(a => a.fileSize! <= MAX_IMAGE_SIZE_MB * 1024 * 1024)
      .map(a => a.uri);
      
      if (!valid.length) return;
      if (res.assets.length > valid.length)
        Alert.alert('Skipped', 'Some images were over the 5MB size limit.');
      
      setImages(p => [...p, ...valid].slice(0, MAX_IMAGES));
    }, [images.length]);
    
    const removeImage = useCallback((i: number) => {
      setImages(p => p.filter((_, idx) => idx !== i));
    }, []);
    
    const handleCreate = useCallback(async () => {
    if (!isValid || !currentUser) return;
    setLoading(true);
    try {
      await addListing({
        title: title.trim(),
        price: parseFloat(price),
        description: description.trim(),
        images,
        userId: currentUser.id,
        sellerId: currentUser.id,
        category: category!.id,
        subcategory,
      });
      Alert.alert('Success!', 'Your listing is now live.', [
        { text: 'View Profile', onPress: () => router.push('/(app)/(tabs)/profile') },
        { text: 'Add Another', onPress: resetForm, style: 'cancel' },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'There was an issue publishing your listing.');
    } finally {
      setLoading(false);
    }
  }, [isValid, currentUser, title, price, description, images, category, subcategory]);

  const resetForm = useCallback(() => {
    Alert.alert('Reset Form', 'Are you sure you want to clear all fields?', [
        { text: 'Cancel', style: 'cancel' },
        { 
            text: 'Reset', 
            style: 'destructive',
            onPress: () => {
                setTitle('');
                setPrice('');
                setDescription('');
                setImages([]);
                if (categories.length > 0) {
                    const first = categories[0];
                    setCategory(first);
                    setSubcategory(first.subcategories[0] ?? '');
                }
            }
        }
    ]);
  }, [categories]);

  // Auth Guard
  if (!currentUser) {
    return (
      <View style={[styles.center, {backgroundColor: theme.background}]}>
        <View style={[styles.loginIcon, { backgroundColor: theme.surface }]}>
            <UploadCloud size={48} color={theme.purple} />
        </View>
        <Text style={[styles.loginTitle, {color: theme.text}]}>Start Selling</Text>
        <Text style={[styles.loginText, {color: theme.secondaryText}]}>Log in to post items on UniMart.</Text>
        <TouchableOpacity style={[styles.loginBtn, {backgroundColor: theme.purple}]} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginBtnText}>Login or Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Verification Guard
  if (!currentUser.isVerified) {
    return (
      <View style={[styles.center, {backgroundColor: theme.background}]}>
        <View style={[styles.loginIcon, { backgroundColor: theme.lightPurple || '#F3E8FF' }]}>
            <BadgeCheck size={48} color={theme.purple} />
        </View>
        <Text style={[styles.loginTitle, {color: theme.text}]}>Get Verified</Text>
        <Text style={[styles.loginText, {color: theme.secondaryText}]}>You need to verify your student identity before you can start selling on UniMart.</Text>
        <TouchableOpacity style={[styles.loginBtn, {backgroundColor: theme.purple}]} onPress={() => router.push('/(app)/verify')}>
          <Text style={styles.loginBtnText}>Verify Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, {color: theme.text}]}>New Listing</Text>
        <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
            <Text style={[styles.resetText, { color: theme.secondaryText }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="on-drag"
      >
        
        {/* Photos Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.label, {color: theme.text}]}>Photos</Text>
                <Text style={[styles.counter, {color: theme.secondaryText}]}>{images.length}/{MAX_IMAGES}</Text>
            </View>
            <View style={styles.imageGrid}>
                {images.map((uri, i) => (
                    <View key={`${uri}-${i}`} style={styles.imageWrapper}>
                        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
                        <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                            <XCircle size={22} color="white" fill={theme.purple || "#FF4444"} />
                        </TouchableOpacity>
                    </View>
                ))}
                {images.length < MAX_IMAGES && (
                    <TouchableOpacity
                        style={[styles.photoUploader, {backgroundColor: theme.surface, borderColor: theme.lightPurple || '#e0e0e0'}]}
                        onPress={pickImages}
                    >
                        <Camera size={28} color={theme.purple} />
                        <Text style={[styles.uploadText, { color: theme.purple }]}>Add Photo</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
            <Text style={[styles.label, {color: theme.text}]}>Title</Text>
            <TextInput 
                placeholder="What are you selling?" 
                placeholderTextColor={theme.secondaryText}
                style={[styles.input, {backgroundColor: theme.surface, color: theme.text}]} 
                value={title} 
                onChangeText={setTitle} 
                maxLength={80} 
            />

            <Text style={[styles.label, {color: theme.text}]}>Price</Text>
            <View style={[styles.priceInputContainer, { backgroundColor: theme.surface }]}>
                <Text style={[styles.currencySymbol, { color: theme.text }]}>₦</Text>
                <TextInput
                    placeholder="0.00"
                    placeholderTextColor={theme.secondaryText}
                    style={[styles.priceInput, {color: theme.text}]}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={t => setPrice(t.replace(/[^0-9]/g, ''))}
                    maxLength={10}
                />
            </View>

            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.label, {color: theme.text}]}>Category</Text>
                    <TouchableOpacity style={[styles.dropdown, {backgroundColor: theme.surface}]} onPress={() => setCatModal(true)}>
                        <Text numberOfLines={1} style={[styles.dropdownText, {color: category ? theme.text : theme.secondaryText}]}>
                            {category?.name ?? 'Select'}
                        </Text>
                        <ChevronDown size={18} color={theme.secondaryText} />
                    </TouchableOpacity>
                </View>

                {category && category.subcategories.length > 0 && (
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={[styles.label, {color: theme.text}]}>Subcategory</Text>
                        <TouchableOpacity style={[styles.dropdown, {backgroundColor: theme.surface}]} onPress={() => setSubModal(true)}>
                            <Text numberOfLines={1} style={[styles.dropdownText, {color: subcategory ? theme.text : theme.secondaryText}]}>
                                {subcategory || 'Select'}
                            </Text>
                            <ChevronDown size={18} color={theme.secondaryText} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.sectionHeader}>
                <Text style={[styles.label, {color: theme.text}]}>Description</Text>
                <Text style={[styles.counter, {color: theme.secondaryText}]}>{description.length}/1000</Text>
            </View>
            <TextInput
                placeholder="Describe your item in detail..."
                placeholderTextColor={theme.secondaryText}
                style={[styles.textArea, {backgroundColor: theme.surface, color: theme.text}]}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                maxLength={1000}
            />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, {backgroundColor: theme.purple}, (!isValid || loading) && styles.submitBtnDisabled]}
          onPress={handleCreate}
          disabled={!isValid || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.submitText}>Publish Listing</Text>
              <ChevronRight size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal 
        visible={catModal} 
        transparent={Platform.OS !== 'android'} 
        animationType="slide"
        onRequestClose={() => setCatModal(false)}
      >
        <View style={Platform.OS === 'android' ? styles.modalOverlayAndroid : styles.modalOverlay}>
            {Platform.OS !== 'android' && (
              <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setCatModal(false)} />
            )}
            <View style={[
              Platform.OS === 'android' ? styles.modalContentAndroid : styles.modalContent, 
              {backgroundColor: theme.background}
            ]}>
                <View style={[styles.modalHeader, Platform.OS === 'android' && { paddingTop: 16 }]}>
                    <Text style={[styles.modalTitle, {color: theme.text}]}>Select Category</Text>
                    <TouchableOpacity style={styles.modalClose} onPress={() => setCatModal(false)}>
                        <X size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={categories}
                    keyExtractor={i => i.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.modalItem, {borderBottomColor: theme.surface}]}
                            onPress={() => {
                                setCategory(item);
                                setSubcategory(item.subcategories[0] ?? '');
                                setCatModal(false);
                            }}
                        >
                            <Text style={[styles.modalItemText, {color: theme.text}]}>{item.name}</Text>
                            {category?.id === item.id && <ChevronRight size={20} color={theme.purple} />}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>

      {/* Subcategory Modal */}
      <Modal 
        visible={subModal} 
        transparent={Platform.OS !== 'android'} 
        animationType="slide"
        onRequestClose={() => setSubModal(false)}
      >
        <View style={Platform.OS === 'android' ? styles.modalOverlayAndroid : styles.modalOverlay}>
            {Platform.OS !== 'android' && (
              <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSubModal(false)} />
            )}
            <View style={[
              Platform.OS === 'android' ? styles.modalContentAndroid : styles.modalContent, 
              {backgroundColor: theme.background}
            ]}>
                <View style={[styles.modalHeader, Platform.OS === 'android' && { paddingTop: 16 }]}>
                    <Text style={[styles.modalTitle, {color: theme.text}]}>Select Subcategory</Text>
                    <TouchableOpacity style={styles.modalClose} onPress={() => setSubModal(false)}>
                        <X size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={category?.subcategories ?? []}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.modalItem, {borderBottomColor: theme.surface}]}
                            onPress={() => {
                                setSubcategory(item);
                                setSubModal(false);
                            }}
                        >
                            <Text style={[styles.modalItemText, {color: theme.text}]}>{item}</Text>
                            {subcategory === item && <ChevronRight size={20} color={theme.purple} />}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: PADDING },
  
  // Login State
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loginIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  loginTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  loginText: { fontSize: 16, marginBottom: 32, textAlign: 'center', maxWidth: 250 },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  resetButton: { padding: 4 },
  resetText: { fontSize: 15, fontWeight: '500' },

  // Sections
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  counter: { fontSize: 12 },
  row: { flexDirection: 'row' },

  // Inputs
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  textArea: { borderRadius: 12, paddingHorizontal: 16, paddingTop: 14, fontSize: 16, height: 120 },
  
  priceInputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 50 },
  currencySymbol: { fontSize: 18, fontWeight: '600', marginRight: 4 },
  priceInput: { flex: 1, fontSize: 18, fontWeight: '600', height: '100%' },

  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  dropdownText: { fontSize: 15, flex: 1 },

  // Image Grid
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  imageWrapper: { position: 'relative' },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 12 },
  removeBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: 'white', borderRadius: 12 },
  
  photoUploader: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  uploadText: { fontSize: 12, fontWeight: '600', marginTop: 4 },

  // Submit
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 14, marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 17, marginRight: 8 },

  // Modals
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalOverlayAndroid: { flex: 1 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '80%' },
  modalContentAndroid: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalClose: { padding: 4, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  modalItemText: { fontSize: 16, fontWeight: '500' },
});