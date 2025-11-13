// app/product-detail.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Heart,
  MessageCircle,
  Phone,
  Share2,
  ShoppingCart,
  Star,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { chats, reviews, users } from '../constants/mockData';
import { useCart, type CartItem } from '../contexts/CartContext';
import { useListings, type Listing } from '../contexts/ListingsContext';
import { useNotification } from '../contexts/NotificationContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { listings } = useListings();
  const product = listings.find((p) => p.id === id) as Listing | undefined;
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { addNotification } = useNotification();

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  const seller = users.find((u) => u.id === product.sellerId);
  const sellerProducts = listings
    .filter((p) => p.sellerId === product.sellerId && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images[0],
      sellerId: product.sellerId,
    };
    addToCart(cartItem);
    addNotification(`${product.title} added to cart!`, 'success');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ────────────────────── IMAGE CAROUSEL ────────────────────── */}
        <View style={styles.imageContainer}>
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
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              color={isFavorite ? '#FF6B6B' : '#8e8e93'}
              size={22}
              fill={isFavorite ? '#FF6B6B' : 'none'}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton}>
            <Share2 color="#8e8e93" size={22} strokeWidth={2} />
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
            <Text style={styles.productName}>{product.title}</Text>
            <Text style={styles.productPrice}>
              ₦{product.price.toLocaleString()}
            </Text>
            {product.description && (
              <Text style={styles.productDescription}>
                {product.description}
              </Text>
            )}
          </View>

          {/* Seller Card */}
          {seller && (
            <TouchableOpacity
              style={styles.sellerCard}
              onPress={() => router.push(`/seller-profile?id=${seller.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.sellerHeader}>
                <View style={styles.sellerAvatar}>
                  <Image
                    source={{ uri: seller.profilePicture }}
                    style={styles.sellerAvatarImage}
                  />
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{seller.name}</Text>
                  <View style={styles.sellerStats}>
                    <Star color="#FFB800" size={14} fill="#FFB800" strokeWidth={2} />
                    <Text style={styles.sellerRating}>{seller.rating}</Text>
                    <Text style={styles.sellerReviews}>
                      ({seller.totalReviews} reviews)
                    </Text>
                  </View>
                  <Text style={styles.sellerProducts}>
                    {seller.productsCount} products listed
                  </Text>
                </View>
              </View>
              <Text style={styles.viewProfile}>View Profile</Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Phone color="#000" size={20} strokeWidth={2} />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => {
                const currentUser = users[0];
                if (!seller) return;
                let chat = chats.find(
                  (c) => c.sellerId === seller.id && c.userId === currentUser.id
                );
                if (chat) {
                  router.push(`/chat/${chat.id}`);
                } else {
                  const newChat = {
                    id: (chats.length + 1).toString(),
                    sellerId: seller.id,
                    userId: currentUser.id,
                    name: seller.name,
                    avatar: seller.profilePicture,
                    lastMessage: '',
                    lastSeen: '',
                    messages: [],
                  };
                  chats.push(newChat);
                  router.push(`/chat/${newChat.id}`);
                }
              }}
            >
              <MessageCircle color="#000" size={20} strokeWidth={2} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              {reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
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
                  {/* <Text style={styles.reviewComment}>{review.commentComment}</Text> */}
                </View>
              ))}
            </View>
          )}

          {/* More from Seller */}
          {sellerProducts.length > 0 && (
            <View style={styles.moreSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>More from this seller</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See all</Text>
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
                    style={styles.moreProductCard}
                    onPress={() => router.push(`/product-detail?id=${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: item.images[0] }} style={styles.moreProductImage} />
                    <Text style={styles.moreProductName} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.moreProductPrice}>
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

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <ShoppingCart color="#fff" size={20} strokeWidth={2} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─────────────────────── STYLES ─────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  errorText: { color: '#000', fontSize: 16, textAlign: 'center', marginTop: 100 },

  /* ─────── IMAGE CAROUSEL ─────── */
  imageContainer: {
    position: 'relative',
    backgroundColor: '#f5f5f7',
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
  productName: { fontSize: 26, fontWeight: '700', color: '#000', marginBottom: 12, lineHeight: 32 },
  productPrice: { fontSize: 32, fontWeight: '800', color: '#6200ea', marginBottom: 16 },
  productDescription: { fontSize: 16, lineHeight: 24, color: '#3c3c43' },

  /* Seller Card */
  sellerCard: { backgroundColor: '#f5f5f7', padding: 18, borderRadius: 14, marginBottom: 20 },
  sellerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sellerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e8d5ff', overflow: 'hidden', marginRight: 14 },
  sellerAvatarImage: { width: 56, height: 56, borderRadius: 28 },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 17, fontWeight: '700', color: '#000', marginBottom: 6 },
  sellerStats: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  sellerRating: { fontSize: 14, fontWeight: '600', color: '#000' },
  sellerReviews: { fontSize: 13, color: '#8e8e93' },
  sellerProducts: { fontSize: 13, color: '#8e8e93' },
  viewProfile: { fontSize: 15, fontWeight: '600', color: '#6200ea' },

  /* Action Buttons */
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: { fontSize: 15, fontWeight: '600', color: '#000' },

  /* Reviews */
  reviewsSection: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#000' },
  seeAll: { fontSize: 15, fontWeight: '600', color: '#6200ea' },
  reviewCard: { backgroundColor: '#f5f5f7', padding: 16, borderRadius: 12, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewerName: { fontSize: 15, fontWeight: '600', color: '#000' },
  reviewDate: { fontSize: 13, color: '#8e8e93' },
  reviewRating: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  reviewComment: { fontSize: 14, lineHeight: 20, color: '#3c3c43' },

  /* More from Seller */
  moreSection: { marginBottom: 20 },
  moreProducts: { marginHorizontal: -20 },
  moreProductsContent: { paddingHorizontal: 20 },
  moreProductCard: { width: 150, marginRight: 12, backgroundColor: '#ffffffff', borderRadius: 12, padding: 10 },
  moreProductImage: { width: 130, height: 130, borderRadius: 10, marginBottom: 10, backgroundColor: '#fff' },
  moreProductName: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 6, lineHeight: 18 },
  moreProductPrice: { fontSize: 16, fontWeight: '700', color: '#6200ea' },

  /* Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e7',
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
    backgroundColor: '#6200ea',
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#4a00b8',
    borderRadius: 12,
  },
  buyNowText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});