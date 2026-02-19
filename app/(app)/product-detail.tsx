import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  X,
  BadgeCheck
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
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
import { useCart, type CartItem } from '../../contexts/CartContext';
import { useListings, type Listing } from '../../contexts/ListingsContext';
import { useNotification } from '../../contexts/NotificationContext';
import { db } from '../../firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userId: string;
  createdAt: any;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { listings } = useListings();
  const product = listings.find((p) => p.id === id) as Listing | undefined;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors.light;

  // State
  const [isFavorite, setIsFavorite] = useState(false);
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Listing[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [showAddedToCartMessage, setShowAddedToCartMessage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Contexts
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  const { currentUser, toggleFavorite } = useAuth();
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (product && currentUser) {
      setIsFavorite(currentUser.favorites?.includes(product.id) || false);
    }
  }, [product, currentUser]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (product) {
      const fetchSeller = async () => {
        const sellerDocRef = doc(db, 'users', product.sellerId);
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
          setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
        }
      };
      const fetchReviews = async () => {
        const reviewsCollectionRef = collection(db, 'listings', product.id, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsCollectionRef);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(reviewsData);
      };
      const fetchSellerProducts = async () => {
        const q = query(
          collection(db, 'listings'),
          where('sellerId', '==', product.sellerId),
          where('id', '!=', product.id),
          limit(4)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        setSellerProducts(products);
      };
      fetchSeller();
      fetchReviews();
      fetchSellerProducts();
    }
  }, [product]);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Product not found.</Text>
            <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Handlers ---

  const handleAddToCart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images[0],
      sellerId: product.sellerId,
    };
    addToCart(cartItem);
    setShowAddedToCartMessage(true);
    timeoutRef.current = setTimeout(() => {
      setShowAddedToCartMessage(false);
    }, 3000);
  };

  const handleBuyNow = async () => {
    if (!currentUser) {
      addNotification('You need to be logged in to make a purchase.', 'error');
      return;
    }
    const itemToBuy = {
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      sellerId: product.sellerId
    };
    router.push({
      pathname: '/checkout',
      params: { buyNowItem: JSON.stringify(itemToBuy) }
    });
  };

  const handleAddReview = async () => {
    if (!currentUser) return Alert.alert('Error', 'Login required.');
    if (newRating === 0 || newReview.trim() === '') return Alert.alert('Error', 'Rating and comment required.');

    try {
      const reviewsCollectionRef = collection(db, 'listings', product.id, 'reviews');
      
      const reviewData = {
        rating: newRating,
        comment: newReview.trim(),
        userName: currentUser.username || currentUser.name || 'Anonymous',
        userId: currentUser.id,
        createdAt: serverTimestamp(),
      };

      await addDoc(reviewsCollectionRef, reviewData);
      
      setNewReview('');
      setNewRating(0);
      setReviewModalVisible(false);
      addNotification('Review submitted!', 'success');
      
      // Refresh
      try {
        const reviewsSnapshot = await getDocs(reviewsCollectionRef);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(reviewsData);
      } catch (refreshError) {
        console.error('Error refreshing reviews:', refreshError);
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      Alert.alert('Error', `Failed to submit review: ${error.message || 'Unknown error'}`);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index);
    }
  }).current;

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      addNotification('Please login to favorite items', 'error');
      return;
    }
    if (product) {
      await toggleFavorite(product.id);
      setIsFavorite(!isFavorite);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const shareMessage = `Check out ${product.title} on UniMart for ₦${product.price.toLocaleString()}!`;
    
    try {
      const result = await Share.share({
        title: product.title,
        message: shareMessage,
        // Optional: url: 'https://unimart.com/product/' + product.id
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      // Fallback to clipboard if share fails
      try {
        await Clipboard.setStringAsync(shareMessage);
        addNotification('Link copied to clipboard', 'success');
      } catch (clipError) {
        Alert.alert('Error', 'Failed to share or copy product');
      }
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Toast Notification */}
      {showAddedToCartMessage && (
        <View style={[styles.toast, { top: insets.top + 10, backgroundColor: '#27ae60' }]}>
          <ShieldCheck color="white" size={20} />
          <Text style={styles.toastText}>Added to cart</Text>
        </View>
      )}

      {/* Floating Header */}
      <View style={[styles.floatingHeader, { top: insets.top }]}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
            <ArrowLeft color={theme.text} size={22} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.circleBtn} onPress={handleToggleFavorite}>
                <Heart color={isFavorite ? theme.primary : theme.text} fill={isFavorite ? theme.primary : 'none'} size={22} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn} onPress={handleShare}>
                <Share2 color={theme.text} size={22} />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.productImage} />
            )}
          />
          {/* Pagination */}
          <View style={styles.pagination}>
            {product.images.map((_, i) => (
              <View 
                key={i} 
                style={[
                    styles.dot, 
                    { backgroundColor: i === currentImageIndex ? theme.primary : 'rgba(255,255,255,0.5)', width: i === currentImageIndex ? 20 : 8 }
                ]} 
              />
            ))}
          </View>
        </View>

        <View style={styles.contentContainer}>
          
          {/* Title & Price */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: theme.text }]}>{product.title}</Text>
            <Text style={[styles.price, { color: theme.text }]}>₦{product.price.toLocaleString()}</Text>
            
            <View style={styles.ratingRow}>
                <Star fill="#F59E0B" color="#F59E0B" size={16} />
                <Text style={[styles.ratingText, { color: theme.text }]}>{averageRating}</Text>
                <Text style={[styles.reviewCount, { color: theme.mutedText }]}>({reviews.length} reviews)</Text>
            </View>
          </View>

          {/* Seller Row (Compact) */}
          {seller && (
            <TouchableOpacity 
                style={[styles.sellerRow, { backgroundColor: theme.surface }]}
                onPress={() => router.push(`/seller-profile?id=${seller.id}`)}
                activeOpacity={0.7}
            >
                <Image source={{ uri: seller.profilePicture }} style={styles.sellerAvatar} />
                <View style={styles.sellerInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.sellerName, { color: theme.text }]}>{seller.name}</Text>
                        {seller.isVerified && <BadgeCheck size={16} color={theme.primary} />}
                    </View>
                    <Text style={[styles.sellerRole, { color: theme.secondaryText }]}>{seller.isVerified ? 'Verified Seller' : 'Local Seller'}</Text>
                </View>
                <View style={styles.iconButton}>
                    <ChevronRight color={theme.mutedText} size={20} />
                </View>
            </TouchableOpacity>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
            <Text style={[styles.description, { color: theme.secondaryText }]}>
                {product.description}
            </Text>
          </View>
            
          {/* Reviews Preview */}
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Reviews</Text>
                <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
                    <Text style={[styles.linkText, { color: theme.primary }]}>Write Review</Text>
                </TouchableOpacity>
             </View>
             {reviews.length === 0 ? (
                 <Text style={{ color: theme.mutedText, fontStyle: 'italic', fontSize: 14 }}>No reviews yet.</Text>
             ) : (
                 reviews.slice(0, 2).map((r) => (
                     <View key={r.id} style={[styles.reviewItem, { borderBottomColor: theme.secondaryBackground }]}>
                         <View style={styles.reviewHeader}>
                             <Text style={[styles.reviewerName, { color: theme.text }]}>{r.userName}</Text>
                             <View style={styles.starsRow}>
                                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                                <Text style={{fontSize:12, marginLeft:4, color: theme.text, fontWeight: '600'}}>{r.rating}</Text>
                             </View>
                         </View>
                         <Text style={[styles.reviewComment, { color: theme.secondaryText }]}>{r.comment}</Text>
                     </View>
                 ))
             )}
          </View>
          
          {/* More from Seller */}
          {sellerProducts.length > 0 && (
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>More from this seller</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingVertical: 10 }}>
                    {sellerProducts.map((p) => (
                        <TouchableOpacity 
                            key={p.id} 
                            style={[styles.miniCard, { backgroundColor: theme.surface }]}
                            onPress={() => router.push(`/product-detail?id=${p.id}`)}
                        >
                            <Image source={{ uri: p.images[0] }} style={styles.miniCardImage} />
                            <Text numberOfLines={1} style={[styles.miniCardTitle, { color: theme.text }]}>{p.title}</Text>
                            <Text style={[styles.miniCardPrice, { color: theme.text }]}>₦{p.price.toLocaleString()}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: theme.secondaryText }]}>Total Price</Text>
            <Text style={[styles.totalPrice, { color: theme.text }]}>₦{product.price.toLocaleString()}</Text>
        </View>
        <View style={styles.cartActions}>
            <TouchableOpacity style={[styles.cartIconBtn, { borderColor: theme.secondaryBackground }]} onPress={handleAddToCart}>
                <ShoppingCart color={theme.text} size={22} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buyBtn, { backgroundColor: theme.primary }]} onPress={handleBuyNow}>
                <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Review Modal */}
      <Modal animationType="slide" transparent visible={reviewModalVisible} onRequestClose={() => setReviewModalVisible(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              activeOpacity={1} 
              onPress={() => setReviewModalVisible(false)} 
            />
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>Write a Review</Text>
                    <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                        <X size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.ratingSelect}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <TouchableOpacity key={s} onPress={() => setNewRating(s)}>
                            <Star size={32} color="#F59E0B" fill={s <= newRating ? "#F59E0B" : 'none'} />
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput
                    style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text }]}
                    placeholder="Describe your experience..."
                    placeholderTextColor={theme.mutedText}
                    multiline
                    value={newReview}
                    onChangeText={setNewReview}
                    autoFocus={false}
                />
                <TouchableOpacity style={[styles.modalSubmit, { backgroundColor: theme.primary }]} onPress={handleAddReview}>
                    <Text style={styles.modalSubmitText}>Submit Review</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Floating Header
  floatingHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerRight: { flexDirection: 'row', gap: 12 },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },

  // Carousel
  carouselContainer: { position: 'relative', height: 400 },
  productImage: { width: SCREEN_WIDTH, height: 400, resizeMode: 'cover' },
  pagination: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { height: 6, borderRadius: 3 },

  // Content
  contentContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: '#F7F8FA',
    padding: 24,
    minHeight: 500,
  },
  headerSection: { marginBottom: 28 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, lineHeight: 28 },
  price: { fontSize: 26, fontWeight: '700', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 14, fontWeight: '700' },
  reviewCount: { fontSize: 14 },

  // Seller Row
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#F1F5F9' },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 15, fontWeight: '600' },
  sellerRole: { fontSize: 13 },
  iconButton: { padding: 4 },

  // Sections
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  linkText: { fontSize: 14, fontWeight: '600' },
  description: { fontSize: 15, lineHeight: 22 },

  // Reviews
  reviewItem: { paddingVertical: 16, borderBottomWidth: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewerName: { fontWeight: '600', fontSize: 14 },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  reviewComment: { fontSize: 14, lineHeight: 20 },

  // Mini Cards (More from seller)
  miniCard: { width: 150, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  miniCardImage: { width: 126, height: 126, borderRadius: 10, marginBottom: 10, alignSelf: 'center', backgroundColor: '#F1F5F9' },
  miniCardTitle: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  miniCardPrice: { fontSize: 14, fontWeight: '700' },

  // Sticky Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceContainer: { justifyContent: 'center' },
  priceLabel: { fontSize: 12, marginBottom: 2 },
  totalPrice: { fontSize: 20, fontWeight: '700' },
  cartActions: { flexDirection: 'row', gap: 12 },
  cartIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtn: {
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  ratingSelect: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  modalInput: { height: 120, borderRadius: 12, padding: 16, fontSize: 15, textAlignVertical: 'top', marginBottom: 24 },
  modalSubmit: { padding: 16, borderRadius: 12, alignItems: 'center' },
  modalSubmitText: { color: 'white', fontSize: 16, fontWeight: '600' },

  // Misc
  toast: { position: 'absolute', alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center', zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  toastText: { color: 'white', fontWeight: '600', fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, marginBottom: 20, color: '#475569' },
  backButtonSimple: { padding: 12, backgroundColor: '#2563EB', borderRadius: 10 },
  backButtonText: { fontSize: 14, color: 'white', fontWeight: '600' }
});
