import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../constants/Colors';
import mockData, { Category } from '../../constants/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useListings } from '../../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 40 - 20) / 3;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_MB = 5;

export default function AddScreen() {
  const router = useRouter();
  const { addListing } = useListings();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Modal states ─────────────────────────────────────
  const [catModal, setCatModal] = useState(false);
  const [subModal, setSubModal] = useState(false);

  // ── Initialise first category ───────────────────────
  useEffect(() => {
    if (mockData.length && !category) {
      const first = mockData[0];
      setCategory(first);
      setSubcategory(first.subcategories[0] ?? '');
    }
  }, []);

  // ── Validation ───────────────────────────────────────
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

  // ── Image picker (multiple) ─────────────────────────
  const pickImages = useCallback(async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit', `Max ${MAX_IMAGES} photos.`);
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
      Alert.alert('Skipped', 'Some images >5 MB.');

    setImages(p => [...p, ...valid].slice(0, MAX_IMAGES));
  }, [images.length]);

  const removeImage = useCallback((i: number) => {
    setImages(p => p.filter((_, idx) => idx !== i));
  }, []);

  // ── Submit ───────────────────────────────────────────
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
  sellerId: currentUser.id,  // ← ADD THIS LINE
  category: category!.id,
  subcategory,
});
      Alert.alert('Success!', 'Listing published!', [
        { text: 'Profile', onPress: () => router.push('/(tabs)/profile') },
        { text: 'Add Another', onPress: resetForm },
      ]);
    } catch {
      Alert.alert('Error', 'Try again.');
    } finally {
      setLoading(false);
    }
  }, [isValid, currentUser, title, price, description, images, category, subcategory]);

  const resetForm = useCallback(() => {
    setTitle('');
    setPrice('');
    setDescription('');
    setImages([]);
    if (mockData[0]) {
      setCategory(mockData[0]);
      setSubcategory(mockData[0].subcategories[0] ?? '');
    }
  }, []);

  // ── UI ───────────────────────────────────────────────
  if (!currentUser) {
    return (
      <View style={styles.center}>
        <Text style={styles.loginText}>Log in to sell</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Sell on UniMart</Text>

      {/* Title */}
      <Text style={styles.label}>Title</Text>
      <TextInput placeholder="e.g. iPhone 14 Pro Max" style={styles.input} value={title} onChangeText={setTitle} maxLength={80} />

      {/* Price */}
      <Text style={styles.label}>Price (₦)</Text>
      <TextInput
        placeholder="150000"
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={t => setPrice(t.replace(/[^0-9]/g, ''))}
        maxLength={10}
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        placeholder="Condition, specs, reason..."
        style={styles.textArea}
        multiline
        value={description}
        onChangeText={setDescription}
        maxLength={1000}
      />
      <Text style={styles.charCount}>{description.length}/1000</Text>

      {/* Photo uploader */}
      <Text style={styles.label}>Photos ({images.length}/{MAX_IMAGES})</Text>
      <TouchableOpacity
        style={[styles.photoUploader, images.length >= MAX_IMAGES && styles.disabled]}
        onPress={pickImages}
        disabled={images.length >= MAX_IMAGES}
      >
        <Ionicons name="camera-outline" size={32} color={Colors.light.purple} />
        <Text style={styles.photoText}>
          {images.length ? 'Add more' : 'Tap to add photos'}
        </Text>
      </TouchableOpacity>

      {/* Image grid */}
      {images.length > 0 && (
        <View style={styles.imageGrid}>
          {images.map((uri, i) => (
            <View key={`${uri}-${i}`} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} resizeMode="cover" />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ── CATEGORY MENU ───────────────────────────────────── */}
      <Text style={styles.label}>Category</Text>
      <TouchableOpacity style={styles.menuBtn} onPress={() => setCatModal(true)}>
        <Text style={styles.menuText}>{category?.name ?? 'Select category'}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {/* ── SUBCATEGORY MENU ─────────────────────────────────── */}
      {category && category.subcategories.length > 0 && (
        <>
          <Text style={styles.label}>Subcategory</Text>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setSubModal(true)}>
            <Text style={styles.menuText}>{subcategory || 'Select subcategory'}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]}
        onPress={handleCreate}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="rocket" size={24} color="white" />
            <Text style={styles.submitText}>Publish Listing</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 60 }} />

      {/* ── CATEGORY MODAL ───────────────────────────────────── */}
      <Modal visible={catModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCatModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={mockData}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(item);
                    setSubcategory(item.subcategories[0] ?? '');
                    setCatModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#aaa" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ── SUBCATEGORY MODAL ─────────────────────────────────── */}
      <Modal visible={subModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subcategory</Text>
              <TouchableOpacity onPress={() => setSubModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={category?.subcategories ?? []}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSubcategory(item);
                    setSubModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ── STYLES ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 16, color: '#555', marginBottom: 16 },
  loginBtn: { backgroundColor: Colors.light.purple, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  loginBtnText: { color: '#fff', fontWeight: '600' },

  header: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 8 },

  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },

  textArea: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 16,
    height: 130,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#eee',
  },
  charCount: { fontSize: 12, color: '#888', textAlign: 'right', marginTop: 6 },

  photoUploader: {
    backgroundColor: '#f5f0ff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.purple,
    borderStyle: 'dashed',
  },
  disabled: { opacity: 0.6 },
  photoText: { marginTop: 8, color: Colors.light.purple, fontWeight: '600', fontSize: 16 },

  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 10 },
  imageWrapper: { position: 'relative' },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 14 },
  removeBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 14,
    padding: 2,
  },

  // ── MENU BUTTON ─────────────────────────────────────
  menuBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  menuText: { fontSize: 16, color: '#333' },

  // ── MODAL ───────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: { fontSize: 16, color: '#333' },

  submitBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.light.purple,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  submitBtnDisabled: { backgroundColor: '#d0b8ff' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 17, marginLeft: 10 },
});