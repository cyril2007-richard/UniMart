import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Phone,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  X
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
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
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Contexts
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  const { currentUser } = useAuth();
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleMessageSeller = async () => {
    if (!currentUser || !seller || isCreatingChat) {
      addNotification('You need to be logged in to chat.', 'error');
      return;
    }
    setIsCreatingChat(true);
    try {
        // ... (Keep existing chat logic)
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUser.id));
        const querySnapshot = await getDocs(q);
        let existingChat: any = null;
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.participants.includes(seller.id)) existingChat = { id: doc.id, ...data };
        });

        let chatId;
        if (existingChat) {
            chatId = existingChat.id;
        } else {
            const sortedParticipants = [currentUser.id, seller.id].sort();
            const newChatRef = await addDoc(chatsRef, {
                participants: sortedParticipants,
                lastMessage: '',
                lastUpdatedAt: serverTimestamp(),
                users: {
                    [currentUser.id]: { name: currentUser.name, avatar: currentUser.profilePicture },
                    [seller.id]: { name: seller.name, avatar: seller.profilePicture }
                }
            });
            // Update interactions logic omitted for brevity but should remain
            const currentUserInteractionsRef = doc(db, 'users', currentUser.id, 'interactions', seller.id);
            await setDoc(currentUserInteractionsRef, { name: seller.name, avatar: seller.profilePicture, chatId: newChatRef.id });
            const sellerInteractionsRef = doc(db, 'users', seller.id, 'interactions', currentUser.id);
            await setDoc(sellerInteractionsRef, { name: currentUser.name, avatar: currentUser.profilePicture, chatId: newChatRef.id });
            
            chatId = newChatRef.id;
        }

        // Context Message Logic
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const lastMsgQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
        const lastMsgSnapshot = await getDocs(lastMsgQuery);
        let shouldSendContext = true;
        if (!lastMsgSnapshot.empty) {
            const lastMsg = lastMsgSnapshot.docs[0].data();
            if (lastMsg.type === 'product-context' && lastMsg.productId === product.id) shouldSendContext = false;
        }

        if (shouldSendContext) {
            await addDoc(messagesRef, {
                type: 'product-context',
                productId: product.id,
                productTitle: product.title,
                productPrice: product.price,
                productImage: product.images[0],
                senderId: currentUser.id,
                createdAt: serverTimestamp()
            });
        }
        router.push(`/chat/${chatId}`);
    } catch (error) {
      addNotification('Failed to start chat.', 'error');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleAddReview = async () => {
    if (!currentUser) return Alert.alert('Error', 'Login required.');
    if (newRating === 0 || newReview.trim() === '') return Alert.alert('Error', 'Rating and comment required.');

    try {
      const reviewsCollectionRef = collection(db, 'listings', product.id, 'reviews');
      await addDoc(reviewsCollectionRef, {
        rating: newRating,
        comment: newReview,
        userName: currentUser.username,
        createdAt: serverTimestamp(),
      });
      setNewReview('');
      setNewRating(0);
      setReviewModalVisible(false);
      addNotification('Review submitted!', 'success');
      // Refresh
      const reviewsSnapshot = await getDocs(reviewsCollectionRef);
      setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review.');
    }
  };

  const handleCall = () => {
    if (seller && seller.phoneNumber) Linking.openURL(`tel:${seller.phoneNumber}`);
    else Alert.alert('Info', 'Number not available.');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index);
    }
  }).current;

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
            <TouchableOpacity style={styles.circleBtn} onPress={() => setIsFavorite(!isFavorite)}>
                <Heart color={isFavorite ? '#FF4444' : theme.text} fill={isFavorite ? '#FF4444' : 'none'} size={22} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn}>
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
                    { backgroundColor: i === currentImageIndex ? theme.purple : 'rgba(255,255,255,0.5)', width: i === currentImageIndex ? 20 : 8 }
                ]} 
              />
            ))}
          </View>
        </View>

        <View style={styles.contentContainer}>
          
          {/* Title & Price */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: theme.text }]}>{product.title}</Text>
            <Text style={[styles.price, { color: theme.purple }]}>₦{product.price.toLocaleString()}</Text>
            
            <View style={styles.ratingRow}>
                <Star fill={theme.gold} color={theme.gold} size={16} />
                <Text style={[styles.ratingText, { color: theme.text }]}>4.8</Text>
                <Text style={[styles.reviewCount, { color: theme.secondaryText }]}>({reviews.length} reviews)</Text>
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
                    <Text style={[styles.sellerName, { color: theme.text }]}>{seller.name}</Text>
                    <Text style={[styles.sellerRole, { color: theme.secondaryText }]}>Verified Seller</Text>
                </View>
                <View style={styles.iconButton}>
                    <ChevronRight color={theme.secondaryText} size={20} />
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
            
          {/* Action Grid (Call/Chat) */}
          {currentUser?.id !== product.sellerId && (
            <View style={styles.actionGrid}>
                <TouchableOpacity style={[styles.gridActionBtn, { backgroundColor: theme.surface }]} onPress={handleCall}>
                    <Phone color={theme.purple} size={24} />
                    <Text style={[styles.gridActionText, { color: theme.purple }]}>Call Seller</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.gridActionBtn, { backgroundColor: theme.surface }]} onPress={handleMessageSeller} disabled={isCreatingChat}>
                    {isCreatingChat ? <ActivityIndicator color={theme.purple} /> : <MessageCircle color={theme.purple} size={24} />}
                    <Text style={[styles.gridActionText, { color: theme.purple }]}>Chat</Text>
                </TouchableOpacity>
            </View>
          )}

          {/* Reviews Preview */}
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Reviews</Text>
                <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
                    <Text style={[styles.linkText, { color: theme.purple }]}>Write Review</Text>
                </TouchableOpacity>
             </View>
             {reviews.length === 0 ? (
                 <Text style={{ color: theme.secondaryText, fontStyle: 'italic' }}>No reviews yet.</Text>
             ) : (
                 reviews.slice(0, 2).map((r) => (
                     <View key={r.id} style={[styles.reviewItem, { borderBottomColor: theme.surface }]}>
                         <View style={styles.reviewHeader}>
                             <Text style={[styles.reviewerName, { color: theme.text }]}>{r.userName}</Text>
                             <View style={styles.starsRow}>
                                <Star size={12} fill={theme.gold} color={theme.gold} />
                                <Text style={{fontSize:12, marginLeft:4, color: theme.text}}>{r.rating}</Text>
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
                <Text style={[styles.sectionTitle, { color: theme.text }]}>More from {seller?.username}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 10 }}>
                    {sellerProducts.map((p) => (
                        <TouchableOpacity 
                            key={p.id} 
                            style={[styles.miniCard, { backgroundColor: theme.surface }]}
                            onPress={() => router.push(`/product-detail?id=${p.id}`)}
                        >
                            <Image source={{ uri: p.images[0] }} style={styles.miniCardImage} />
                            <Text numberOfLines={1} style={[styles.miniCardTitle, { color: theme.text }]}>{p.title}</Text>
                            <Text style={[styles.miniCardPrice, { color: theme.purple }]}>₦{p.price.toLocaleString()}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.background, paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: theme.secondaryText }]}>Total Price</Text>
            <Text style={[styles.totalPrice, { color: theme.text }]}>₦{product.price.toLocaleString()}</Text>
        </View>
        <View style={styles.cartActions}>
            <TouchableOpacity style={[styles.cartIconBtn, { borderColor: theme.surface }]} onPress={handleAddToCart}>
                <ShoppingCart color={theme.text} size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buyBtn, { backgroundColor: theme.purple }]} onPress={handleBuyNow}>
                <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Review Modal */}
      <Modal animationType="slide" transparent visible={reviewModalVisible} onRequestClose={() => setReviewModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>Write a Review</Text>
                    <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                        <X size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.ratingSelect}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <TouchableOpacity key={s} onPress={() => setNewRating(s)}>
                            <Star size={32} color={theme.gold} fill={s <= newRating ? theme.gold : 'none'} />
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput
                    style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.text }]}
                    placeholder="Describe your experience..."
                    placeholderTextColor={theme.secondaryText}
                    multiline
                    value={newReview}
                    onChangeText={setNewReview}
                />
                <TouchableOpacity style={[styles.modalSubmit, { backgroundColor: theme.purple }]} onPress={handleAddReview}>
                    <Text style={styles.modalSubmitText}>Submit Review</Text>
                </TouchableOpacity>
            </View>
        </View>
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
    paddingTop: 10, // Extra spacing below inset
  },
  headerRight: { flexDirection: 'row', gap: 12 },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  // Carousel
  carouselContainer: { position: 'relative', height: 400 },
  productImage: { width: SCREEN_WIDTH, height: 400, resizeMode: 'cover' },
  pagination: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { height: 8, borderRadius: 4 },

  // Content
  contentContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    backgroundColor: 'white', // Needs to match theme in real app if dark mode exists
    padding: 24,
    minHeight: 500,
  },
  headerSection: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, lineHeight: 30 },
  price: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 14, fontWeight: '700' },
  reviewCount: { fontSize: 14 },

  // Seller Row
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 16, fontWeight: '700' },
  sellerRole: { fontSize: 13 },
  iconButton: { padding: 8 },

  // Sections
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  linkText: { fontSize: 14, fontWeight: '600' },
  description: { fontSize: 15, lineHeight: 24 },

  // Action Grid
  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  gridActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  gridActionText: { fontSize: 15, fontWeight: '600' },

  // Reviews
  reviewItem: { paddingVertical: 12, borderBottomWidth: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewerName: { fontWeight: '600', fontSize: 14 },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  reviewComment: { fontSize: 14, lineHeight: 20 },

  // Mini Cards (More from seller)
  miniCard: { width: 140, padding: 10, borderRadius: 12, marginRight: 12 },
  miniCardImage: { width: 120, height: 120, borderRadius: 8, marginBottom: 8, alignSelf: 'center' },
  miniCardTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
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
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  priceContainer: { justifyContent: 'center' },
  priceLabel: { fontSize: 12, marginBottom: 2 },
  totalPrice: { fontSize: 22, fontWeight: '700' },
  cartActions: { flexDirection: 'row', gap: 12 },
  cartIconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtn: {
    paddingHorizontal: 32,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  ratingSelect: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  modalInput: { height: 100, borderRadius: 12, padding: 16, fontSize: 16, textAlignVertical: 'top', marginBottom: 20 },
  modalSubmit: { padding: 16, borderRadius: 14, alignItems: 'center' },
  modalSubmitText: { color: 'white', fontSize: 16, fontWeight: '700' },

  // Misc
  toast: { position: 'absolute', alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, flexDirection: 'row', gap: 8, alignItems: 'center', zIndex: 100 },
  toastText: { color: 'white', fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, marginBottom: 20 },
  backButtonSimple: { padding: 10 },
  backButtonText: { fontSize: 16, color: '#007AFF' }
});