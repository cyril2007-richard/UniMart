import { Camera, ChevronDown, ChevronRight, DollarSign, Image as ImageIcon, UploadCloud, X, XCircle } from 'lucide-react-native';
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
        <UploadCloud size={64} color={theme.secondaryText} />
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
        <Text style={[styles.title, {color: theme.text}]}>New Listing</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Picker Section */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                <TouchableOpacity
                    style={[styles.addPhotoCard, {backgroundColor: theme.surface, borderColor: theme.tabIconDefault}]}
                    onPress={pickImages}
                >
                    <Camera size={28} color={theme.purple} />
                    <Text style={[styles.addPhotoText, {color: theme.purple}]}>Add Photo</Text>
                    <Text style={[styles.photoLimitText, {color: theme.secondaryText}]}>{images.length}/{MAX_IMAGES}</Text>
                </TouchableOpacity>
                
                {images.map((uri, i) => (
                    <View key={`${uri}-${i}`} style={styles.photoCard}>
                        <Image source={{ uri }} style={styles.photoImage} resizeMode="cover" />
                        <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                            <XCircle size={22} color={theme.white} fill={theme.secondaryText} />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>Details</Text>
            
            <View style={[styles.inputContainer, {backgroundColor: theme.surface}]}>
                <Text style={[styles.inputLabel, {color: theme.secondaryText}]}>Title</Text>
                <TextInput 
                    placeholder="What are you selling?" 
                    style={[styles.input, {color: theme.text}]} 
                    value={title} 
                    onChangeText={setTitle} 
                    maxLength={80} 
                    placeholderTextColor={theme.tabIconDefault}
                />
            </View>

            <View style={[styles.inputContainer, {backgroundColor: theme.surface}]}>
                <Text style={[styles.inputLabel, {color: theme.secondaryText}]}>Price</Text>
                <View style={styles.priceInputWrapper}>
                    <Text style={[styles.currencySymbol, {color: theme.text}]}>₦</Text>
                    <TextInput
                        placeholder="0.00"
                        style={[styles.input, {color: theme.text, flex: 1}]}
                        keyboardType="numeric"
                        value={price ? Number(price).toLocaleString('en-US') : ''}
                        onChangeText={handlePriceChange}
                        maxLength={13}
                        placeholderTextColor={theme.tabIconDefault}
                    />
                </View>
            </View>

            <TouchableOpacity style={[styles.pickerButton, {backgroundColor: theme.surface}]} onPress={() => setCatModal(true)}>
                <View>
                    <Text style={[styles.inputLabel, {color: theme.secondaryText}]}>Category</Text>
                    <Text style={[styles.pickerValue, {color: theme.text}]}>{category?.name ?? 'Select'}</Text>
                </View>
                <ChevronDown size={20} color={theme.secondaryText} />
            </TouchableOpacity>

            {category && category.subcategories.length > 0 && (
                <TouchableOpacity style={[styles.pickerButton, {backgroundColor: theme.surface, marginTop: 12}]} onPress={() => setSubModal(true)}>
                    <View>
                        <Text style={[styles.inputLabel, {color: theme.secondaryText}]}>Subcategory</Text>
                        <Text style={[styles.pickerValue, {color: theme.text}]}>{subcategory || 'Select'}</Text>
                    </View>
                    <ChevronDown size={20} color={theme.secondaryText} />
                </TouchableOpacity>
            )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>Description</Text>
            <View style={[styles.inputContainer, {backgroundColor: theme.surface, height: 150}]}>
                <TextInput
                    placeholder="Describe your item in detail..."
                    style={[styles.textArea, {color: theme.text}]}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    maxLength={1000}
                    textAlignVertical="top"
                    placeholderTextColor={theme.tabIconDefault}
                />
                <Text style={[styles.charCount, {color: theme.secondaryText}]}>{description.length}/1000</Text>
            </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

        {/* Sticky Submit Button */}
        <View style={[styles.footer, {backgroundColor: theme.background, borderTopColor: theme.surface}]}>
            <TouchableOpacity
                style={[styles.submitBtn, {backgroundColor: theme.purple}, (!isValid || loading) && styles.submitBtnDisabled]}
                onPress={handleCreate}
                disabled={!isValid || loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.submitText}>Publish Listing</Text>
                )}
            </TouchableOpacity>
        </View>

        {/* Modals */}
        <Modal visible={catModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: theme.background}]}>
              <View style={[styles.modalHeader, {borderBottomColor: theme.surface}]}>
                <Text style={[styles.modalTitle, {color: theme.text}]}>Category</Text>
                <TouchableOpacity onPress={() => setCatModal(false)} style={styles.modalCloseBtn}>
                  <X size={24} color={theme.text} />
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
          </View>
        </Modal>

        <Modal visible={subModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: theme.background}]}>
              <View style={[styles.modalHeader, {borderBottomColor: theme.surface}]}>
                <Text style={[styles.modalTitle, {color: theme.text}]}>Subcategory</Text>
                <TouchableOpacity onPress={() => setSubModal(false)} style={styles.modalCloseBtn}>
                  <X size={24} color={theme.text} />
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
                    {subcategory === item && <View style={[styles.selectedDot, {backgroundColor: theme.purple}]} />}
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 20 },
    loginText: { fontSize: 18, textAlign: 'center', marginTop: 10 },
    loginBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30 },
    loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
    title: { fontSize: 28, fontWeight: '800' },
    
    scrollContent: { paddingBottom: 40 },
    
    section: { marginBottom: 24, paddingHorizontal: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    
    photoScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
    addPhotoCard: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addPhotoText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    photoLimitText: { fontSize: 10, marginTop: 2 },
    
    photoCard: { width: 100, height: 100, marginRight: 12, borderRadius: 12, position: 'relative' },
    photoImage: { width: '100%', height: '100%', borderRadius: 12 },
    removeBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: 'white', borderRadius: 12 },

    inputContainer: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
    },
    inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
    input: { fontSize: 16, fontWeight: '500', padding: 0 },
    priceInputWrapper: { flexDirection: 'row', alignItems: 'center' },
    currencySymbol: { fontSize: 16, fontWeight: '600', marginRight: 4 },
    
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    pickerValue: { fontSize: 16, fontWeight: '500' },
    
    textArea: { fontSize: 16, flex: 1, padding: 0 },
    charCount: { fontSize: 11, textAlign: 'right', marginTop: 8 },
    
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitText: { color: '#fff', fontWeight: '700', fontSize: 17 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        position: 'relative',
    },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalCloseBtn: { position: 'absolute', right: 20 },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalItemText: { fontSize: 16, fontWeight: '500' },
    selectedDot: { width: 8, height: 8, borderRadius: 4 },
});
