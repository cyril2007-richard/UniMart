import { Camera, ChevronDown, ChevronRight, X, UploadCloud, XCircle } from 'lucide-react-native';
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
import Colors from '../../../constants/Colors';
import { useCategories, Category } from '../../../contexts/CategoryContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useListings } from '../../../contexts/ListingsContext';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 48) / 3;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_MB = 5;

export default function AddScreen() {
  const router = useRouter();
  const { addListing } = useListings();
  const { currentUser } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const theme = Colors.light;

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
      Alert.alert('Limit', `You can upload a maximum of ${MAX_IMAGES} photos.`);
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
      Alert.alert('Success!', 'Your listing has been published.', [
        { text: 'View Profile', onPress: () => router.push('/(app)/(tabs)/profile') },
        { text: 'Add Another', onPress: resetForm, style: 'cancel' },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'There was an issue publishing your listing. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isValid, currentUser, title, price, description, images, category, subcategory]);

  const resetForm = useCallback(() => {
    setTitle('');
    setPrice('');
    setDescription('');
    setImages([]);
    if (categories.length > 0) {
      const first = categories[0];
      setCategory(first);
      setSubcategory(first.subcategories[0] ?? '');
    }
  }, [categories]);

  const handlePriceChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPrice(numericValue);
  }, []);

  if (!currentUser) {
    return (
      <View style={[styles.center, {backgroundColor: theme.background}]}>
        <Text style={[styles.loginText, {color: theme.secondaryText}]}>Log in to sell your items</Text>
        <TouchableOpacity style={[styles.loginBtn, {backgroundColor: theme.purple}]} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginBtnText}>Login or Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.text}]}>Sell on UniMart</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, {color: theme.text}]}>Title</Text>
        <TextInput placeholder="e.g. iPhone 14 Pro Max, 256GB, Like New" style={[styles.input, {backgroundColor: theme.surface, color: theme.text}]} value={title} onChangeText={setTitle} maxLength={80} />

        <Text style={[styles.label, {color: theme.text}]}>Price (₦)</Text>
        <TextInput
          placeholder="150,000"
          style={[styles.input, {backgroundColor: theme.surface, color: theme.text}]}
          keyboardType="numeric"
          value={price ? Number(price).toLocaleString('en-US') : ''}
          onChangeText={handlePriceChange}
          maxLength={13}
        />
        <Text style={[styles.label, {color: theme.text}]}>Photos ({images.length}/{MAX_IMAGES})</Text>
        <View style={styles.imageGrid}>
            {images.map((uri, i) => (
                <View key={`${uri}-${i}`} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} resizeMode="cover" />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                    <XCircle size={24} color="#fff" fill="rgba(0,0,0,0.5)" />
                </TouchableOpacity>
                </View>
            ))}
            {images.length < MAX_IMAGES && (
                <TouchableOpacity
                    style={[styles.photoUploader, {backgroundColor: theme.surface}]}
                    onPress={pickImages}
                >
                    <Camera size={24} color={theme.secondaryText} />
                </TouchableOpacity>
            )}
        </View>

        <Text style={[styles.label, {color: theme.text}]}>Category</Text>
        <TouchableOpacity style={[styles.menuBtn, {backgroundColor: theme.surface}]} onPress={() => setCatModal(true)}>
          <Text style={[styles.menuText, {color: category ? theme.text : theme.secondaryText}]}>{category?.name ?? 'Select category'}</Text>
          <ChevronDown size={20} color={theme.secondaryText} />
        </TouchableOpacity>

        {category && category.subcategories.length > 0 && (
          <>
            <Text style={[styles.label, {color: theme.text}]}>Subcategory</Text>
            <TouchableOpacity style={[styles.menuBtn, {backgroundColor: theme.surface}]} onPress={() => setSubModal(true)}>
              <Text style={[styles.menuText, {color: subcategory ? theme.text : theme.secondaryText}]}>{subcategory || 'Select subcategory'}</Text>
              <ChevronDown size={20} color={theme.secondaryText} />
            </TouchableOpacity>
          </>
        )}

        <Text style={[styles.label, {color: theme.text}]}>Description</Text>
        <TextInput
          placeholder="Include details like condition, specifications, and reason for selling."
          style={[styles.textArea, {backgroundColor: theme.surface, color: theme.text}]}
          multiline
          value={description}
          onChangeText={setDescription}
          maxLength={1000}
        />
        <Text style={[styles.charCount, {color: theme.secondaryText}]}>{description.length}/1000</Text>

        <TouchableOpacity
          style={[styles.submitBtn, {backgroundColor: theme.purple}, (!isValid || loading) && styles.submitBtnDisabled]}
          onPress={handleCreate}
          disabled={!isValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <UploadCloud size={18} color="white" />
              <Text style={styles.submitText}>Publish Listing</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 60 }} />

        <Modal visible={catModal} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCatModal(false)}>
            <View style={[styles.modalContent, {backgroundColor: theme.background}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: theme.text}]}>Select Category</Text>
                <TouchableOpacity onPress={() => setCatModal(false)}>
                  <X size={24} color={theme.secondaryText} />
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
                    <ChevronRight size={20} color={theme.secondaryText} />
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={subModal} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSubModal(false)}>
            <View style={[styles.modalContent, {backgroundColor: theme.background}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: theme.text}]}>Select Subcategory</Text>
                <TouchableOpacity onPress={() => setSubModal(false)}>
                  <X size={24} color={theme.secondaryText} />
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
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, },
    loginText: { fontSize: 17, marginBottom: 16, textAlign: 'center' },
    loginBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    loginBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },

    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, },
    title: { fontSize: 26, fontWeight: '700', },
    label: { fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 10, paddingHorizontal: 24,},
    input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginHorizontal: 24, },
    textArea: { borderRadius: 12, paddingHorizontal: 16, paddingTop: 14, fontSize: 16, height: 130, textAlignVertical: 'top', marginHorizontal: 24, },
    charCount: { fontSize: 12, textAlign: 'right', marginTop: 6, paddingHorizontal: 24, },
    
    imageGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12, },
    imageWrapper: { position: 'relative' },
    image: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 12, },
    removeBtn: { position: 'absolute', top: 4, right: 4, },

    photoUploader: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    menuBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 15, marginHorizontal: 24, },
    menuText: { fontSize: 16, },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24, },
    modalContent: { borderRadius: 16, width: '100%', maxHeight: '70%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', },
    modalTitle: { fontSize: 18, fontWeight: '600' },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, },
    modalItemText: { fontSize: 16, },
    
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginTop: 24, marginHorizontal: 24, gap: 10, },
    submitBtnDisabled: { opacity: 0.5 },
    submitText: { color: '#fff', fontWeight: '700', fontSize: 17, },
});