// app/product-detail.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, limit, query, serverTimestamp, where, setDoc } from 'firebase/firestore';
import {
  Heart,
  MessageCircle,
  Phone,
  Share2,
  ShoppingCart,
  Star,
  X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
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
  useColorScheme,
  View,
  ActivityIndicator,
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
  createdAt: any;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { listings } = useListings();
  const product = listings.find((p) => p.id === id) as Listing | undefined;
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  const { currentUser } = useAuth();
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Listing[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [showAddedToCartMessage, setShowAddedToCartMessage] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colorScheme = useColorScheme();
  const theme = Colors.light;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Product not found.</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images[0],
      sellerId: product.sellerId,
    };
    addToCart(cartItem);
    // addNotification(`${product.title} added to cart!`, 'success');
    setShowAddedToCartMessage(true);
    timeoutRef.current = setTimeout(() => {
      setShowAddedToCartMessage(false);
    }, 3000);
  };

  const handleCancelAddedToCartMessage = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowAddedToCartMessage(false);
  };

  const handleBuyNow = async () => {
    if (!currentUser) {
      addNotification('You need to be logged in to make a purchase.', 'error');
      return;
    }

    // For the buyer
    await addNotification(
      `You have agreed to pay ₦${product.price.toLocaleString()} for ${product.title}.`,
      'info'
    );

    // For the seller - This would typically be handled by a Cloud Function for security reasons.
    // A user cannot directly write to another user's notification collection.
    // For now, we will just show a success message to the buyer.
    addNotification(
      `Your purchase request has been sent to the seller.`,
      'success'
    );

    router.push('/');
  };

  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleMessageSeller = async () => {
    if (!currentUser || !seller || isCreatingChat) {
      addNotification('You need to be logged in to chat.', 'error');
      return;
    }

    setIsCreatingChat(true);

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUser.id)
    );

    const querySnapshot = await getDocs(q);
    let existingChat: any = null;
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(seller.id)) {
        existingChat = { id: doc.id, ...data };
      }
    });

    if (existingChat) {
      router.push(`/chat/${existingChat.id}`);
    } else {
      console.log('Creating new chat with:', {
        currentUser: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.profilePicture,
        },
        seller: {
          id: seller.id,
          name: seller.name,
          avatar: seller.profilePicture,
        },
      });
      const sortedParticipants = [currentUser.id, seller.id].sort();
      const newChatRef = await addDoc(chatsRef, {
        participants: sortedParticipants,
        lastMessage: '',
        lastUpdatedAt: serverTimestamp(),
        users: {
          [currentUser.id]: {
            name: currentUser.name,
            avatar: currentUser.profilePicture,
          },
          [seller.id]: {
            name: seller.name,
            avatar: seller.profilePicture,
          }
        }
      });

      // Add interaction data
      const currentUserInteractionsRef = doc(db, 'users', currentUser.id, 'interactions', seller.id);
      await setDoc(currentUserInteractionsRef, {
        name: seller.name,
        avatar: seller.profilePicture,
      });

      const sellerInteractionsRef = doc(db, 'users', seller.id, 'interactions', currentUser.id);
      await setDoc(sellerInteractionsRef, {
        name: currentUser.name,
        avatar: currentUser.profilePicture,
      });

      router.push(`/chat/${newChatRef.id}`);
    }
    setIsCreatingChat(false);
  };

  const handleAddReview = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to post a review.');
      return;
    }
    if (newRating === 0 || newReview.trim() === '') {
      Alert.alert('Error', 'Please provide a rating and a comment.');
      return;
    }

    try {
      const reviewsCollectionRef = collection(db, 'listings', product.id, 'reviews');
      await addDoc(reviewsCollectionRef, {
        rating: newRating,
        comment: newReview,
        userName: currentUser.name,
        createdAt: serverTimestamp(),
      });
      setNewReview('');
      setNewRating(0);
      setReviewModalVisible(false);
      addNotification('Review submitted successfully!', 'success');
      // Refresh reviews
      const reviewsSnapshot = await getDocs(reviewsCollectionRef);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error adding review: ', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {showAddedToCartMessage && (
        <View style={[styles.addedToCartMessage, { top: insets.top, backgroundColor: '#4CAF50' }]}>
          <Text style={styles.addedToCartMessageText}>
            {product.title} has been added to your cart.
          </Text>
          <TouchableOpacity onPress={handleCancelAddedToCartMessage}>
            <X color="#fff" size={18} />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ────────────────────── IMAGE CAROUSEL ────────────────────── */}
        <View style={[styles.imageContainer, { backgroundColor: theme.lightPurple }]}>
          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.productImage} />
            )}
          />

          {/* Favourite & Share Buttons */}
          <TouchableOpacity
            style={[styles.favoriteButton, { backgroundColor: theme.background }]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              color={isFavorite ? '#FF6B6B' : theme.tabIconDefault}
              size={22}
              fill={isFavorite ? '#FF6B6B' : 'none'}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.background }]}>
            <Share2 color={theme.tabIconDefault} size={22} strokeWidth={2} />
          </TouchableOpacity>

          {/* Pagination Dots */}
          {product.images.length > 1 && (
            <View style={styles.pagination}>
              {product.images.map((_, i) => (
                <View key={i} style={styles.dot} />
              ))}
            </View>
          )}
        </View>
        {/* ───────────────────────────────────────────────────────────── */}

        <View style={styles.contentContainer}>
          {/* Product Info */}
          <View style={styles.productInfoSection}>
            <Text style={[styles.productName, { color: theme.text }]}>{product.title}</Text>
            <Text style={[styles.productPrice, { color: theme.tint }]}>
              ₦{product.price.toLocaleString()}
            </Text>
            {product.description && (
              <Text style={[styles.productDescription, { color: theme.text }]}>
                {product.description}
              </Text>
            )}
          </View>

          {/* Seller Card */}
          {seller && (
            <TouchableOpacity
              style={[styles.sellerCard, { backgroundColor: theme.lightPurple }]}
              onPress={() => router.push(`/seller-profile?id=${seller.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.sellerHeader}>
                <View style={[styles.sellerAvatar, { backgroundColor: theme.purple }]}>
                  <Image
                    source={{ uri: seller.profilePicture }}
                    style={styles.sellerAvatarImage}
                  />
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={[styles.sellerName, { color: theme.text }]}>{seller.name}</Text>
                  <View style={styles.sellerStats}>
                    <Star color="#FFB800" size={14} fill="#FFB800" strokeWidth={2} />
                    <Text style={[styles.sellerRating, { color: theme.text }]}>{seller.rating || 0}</Text>
                    <Text style={[styles.sellerReviews, { color: theme.tabIconDefault }]}>
                      ({seller.totalReviews || 0} reviews)
                    </Text>
                  </View>
                  <Text style={[styles.sellerProducts, { color: theme.tabIconDefault }]}>
                    {seller.productsCount || 0} products listed
                  </Text>
                </View>
              </View>
              <Text style={[styles.viewProfile, { color: theme.tint }]}>View Profile</Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.lightPurple }]} activeOpacity={0.7}>
              <Phone color={theme.text} size={20} strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.lightPurple }]}
              activeOpacity={0.7}
              onPress={handleMessageSeller}
              disabled={isCreatingChat}
            >
              {isCreatingChat ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <>
                  <MessageCircle color={theme.text} size={20} strokeWidth={2} />
                  <Text style={[styles.actionButtonText, { color: theme.text }]}>Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Reviews ({reviews.length})</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
                <Text style={[styles.seeAll, { color: theme.tint }]}>Write a review</Text>
              </TouchableOpacity>
            </View>
            {reviews.map((review) => (
              <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.lightPurple }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewerName, { color: theme.text }]}>{review.userName}</Text>
                  <Text style={[styles.reviewDate, { color: theme.tabIconDefault }]}>
                    {review.createdAt?.toDate().toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      color="#FFB800"
                      size={14}
                      fill={i < review.rating ? '#FFB800' : 'none'}
                      strokeWidth={2}
                    />
                  ))}
                </View>
                <Text style={[styles.reviewComment, { color: theme.text }]}>{review.comment}</Text>
              </View>
            ))}
          </View>

          {/* More from Seller */}
          {sellerProducts.length > 0 && (
            <View style={styles.moreSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>More from this seller</Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAll, { color: theme.tint }]}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.moreProducts}
                contentContainerStyle={styles.moreProductsContent}
              >
                {sellerProducts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.moreProductCard, { backgroundColor: theme.background }]}
                    onPress={() => router.push(`/product-detail?id=${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: item.images[0] }} style={styles.moreProductImage} />
                    <Text style={[styles.moreProductName, { color: theme.text }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={[styles.moreProductPrice, { color: theme.tint }]}>
                      ₦{item.price.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Write a Review</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                  <Star
                    color={star <= newRating ? '#FFB800' : theme.tabIconDefault}
                    fill={star <= newRating ? '#FFB800' : 'none'}
                    size={30}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.reviewInput, { borderColor: theme.tabIconDefault, color: theme.text }]}
              placeholder="Share your thoughts..."
              placeholderTextColor={theme.tabIconDefault}
              value={newReview}
              onChangeText={setNewReview}
              multiline
            />
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.tint }]} onPress={handleAddReview}>
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
              <Text style={[styles.cancelButton, { color: theme.tint }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.tabIconDefault }]}>
        <TouchableOpacity style={[styles.addToCartButton, { backgroundColor: theme.tint }]} onPress={handleAddToCart}>
          <ShoppingCart color={theme.background} size={20} strokeWidth={2} />
          <Text style={[styles.addToCartText, { color: theme.background }]}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buyNowButton, { backgroundColor: theme.purple }]} onPress={handleBuyNow}>
          <Text style={[styles.buyNowText, { color: theme.background }]}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─────────────────────── STYLES ─────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 100 },

  /* ─────── IMAGE CAROUSEL ─────── */
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    position: 'absolute',
    top: 60,
    right: 68,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  /* ─────── CONTENT ─────── */
  contentContainer: { paddingHorizontal: 20, paddingTop: 20 },
  productInfoSection: { marginBottom: 24 },
  productName: { fontSize: 26, fontWeight: '700', marginBottom: 12, lineHeight: 32 },
  productPrice: { fontSize: 32, fontWeight: '800', marginBottom: 16 },
  productDescription: { fontSize: 16, lineHeight: 24 },

  /* Seller Card */
  sellerCard: { padding: 18, borderRadius: 14, marginBottom: 20 },
  sellerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sellerAvatar: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', marginRight: 14 },
  sellerAvatarImage: { width: 56, height: 56, borderRadius: 28 },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  sellerStats: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  sellerRating: { fontSize: 14, fontWeight: '600' },
  sellerReviews: { fontSize: 13 },
  sellerProducts: { fontSize: 13 },
  viewProfile: { fontSize: 15, fontWeight: '600' },

  /* Action Buttons */
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: { fontSize: 15, fontWeight: '600' },

  /* Reviews */
  reviewsSection: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '700' },
  seeAll: { fontSize: 15, fontWeight: '600' },
  reviewCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewerName: { fontSize: 15, fontWeight: '600' },
  reviewDate: { fontSize: 13 },
  reviewRating: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  reviewComment: { fontSize: 14, lineHeight: 20 },

  /* More from Seller */
  moreSection: { marginBottom: 20 },
  moreProducts: { marginHorizontal: -20 },
  moreProductsContent: { paddingHorizontal: 20 },
  moreProductCard: { width: 150, marginRight: 12, borderRadius: 12, padding: 10 },
  moreProductImage: { width: 130, height: 130, borderRadius: 10, marginBottom: 10 },
  moreProductName: { fontSize: 14, fontWeight: '600', marginBottom: 6, lineHeight: 18 },
  moreProductPrice: { fontSize: 16, fontWeight: '700' },

  /* Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: { fontSize: 16, fontWeight: '700' },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buyNowText: { fontSize: 16, fontWeight: '700' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  reviewInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
  },
  addedToCartMessage: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  addedToCartMessageText: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
    marginRight: 10
  },
});