
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, MessageCircle, Phone, Share2, ShoppingCart, Star, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Colors from '../constants/Colors';
import { products, users, reviews, chats } from '../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const product = products.find((p) => p.id === id);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Product not found.</Text> 
      </View>
    );
  }

  const seller = users.find(u => u.id === product.sellerId);

  // Similar products from same seller
  const sellerProducts = products.filter(p => p.sellerId === product.sellerId && p.id !== product.id).slice(0, 4);


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <TouchableOpacity 
            style={[styles.favoriteButton, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart 
              color={isFavorite ? '#FF6B6B' : theme.tabIconDefault} 
              size={22} 
              fill={isFavorite ? '#FF6B6B' : 'none'}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
          >
            <Share2 color={theme.tabIconDefault} size={22} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {/* Product Info */}
          <View style={styles.productInfoSection}>
            <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
            <Text style={[styles.productPrice, { color: theme.purple }]}>
              ₦{product.price.toLocaleString()}
            </Text>
            <Text style={[styles.productDescription, { color: theme.tabIconDefault }]}>
              {product.description}
            </Text>
          </View>

          {/* Seller Info Card */}
          {seller && (
            <TouchableOpacity 
              style={[styles.sellerCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7' }]}
              onPress={() => router.push(`/seller-profile?id=${seller.id}`)}
            >
              <View style={styles.sellerHeader}>
                <View style={styles.sellerAvatar}>
                  <Image source={{ uri: seller.profilePicture }} style={{width: 50, height: 50, borderRadius: 25}} />
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={[styles.sellerName, { color: theme.text }]}>{seller.name}</Text>
                  <View style={styles.sellerStats}>
                    <Star color="#FFB800" size={14} fill="#FFB800" strokeWidth={2} />
                    <Text style={[styles.sellerRating, { color: theme.text }]}>
                      {seller.rating}
                    </Text>
                    <Text style={[styles.sellerReviews, { color: theme.tabIconDefault }]}>
                      ({seller.totalReviews} reviews)
                    </Text>
                  </View>
                  <Text style={[styles.sellerProducts, { color: theme.tabIconDefault }]}>
                    {seller.productsCount} products
                  </Text>
                </View>
              </View>
              <Text style={[styles.viewProfile, { color: theme.purple }]}>View Profile →</Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7' }]}>
              <Phone color={theme.text} size={20} strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Call Seller</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7' }]}
              onPress={() => {
                const currentUser = users[0];
                if (!seller) return;
                let chat = chats.find(c => c.sellerId === seller.id && c.userId === currentUser.id);
                if (chat) {
                  router.push(`/chat/${chat.id}`);
                } else {
                  const newChat = {
                    id: (chats.length + 1).toString(),
                    sellerId: seller.id,
                    userId: currentUser.id,
                    name: seller.name,
                    avatar: seller.profilePicture,
                    lastMessage: "",
                    lastSeen: "",
                    messages: [],
                  };
                  chats.push(newChat);
                  router.push(`/chat/${newChat.id}`);
                }
              }}
            >
              <MessageCircle color={theme.text} size={20} strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Reviews ({reviews.length})
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: theme.purple }]}>See all</Text>
              </TouchableOpacity>
            </View>

            {reviews.slice(0, 2).map((review) => (
              <View 
                key={review.id} 
                style={[styles.reviewCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7' }]}
              >
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewerName, { color: theme.text }]}>
                    {review.name}
                  </Text>
                  <Text style={[styles.reviewDate, { color: theme.tabIconDefault }]}>
                    {review.date}
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
                <Text style={[styles.reviewComment, { color: theme.text }]}>
                  {review.comment}
                </Text>
              </View>
            ))}
          </View>

          {/* More from this seller */}
          <View style={styles.moreSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                More from this seller
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: theme.purple }]}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moreProducts}>
              {sellerProducts.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.moreProductCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f7' }]}
                  onPress={() => router.push(`/product-detail?id=${item.id}`)}
                >
                  <Image source={{ uri: item.image }} style={styles.moreProductImage} />
                  <Text style={[styles.moreProductName, { color: theme.text }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[styles.moreProductPrice, { color: theme.purple }]}>
                    ₦{item.price.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: colorScheme === 'dark' ? '#2c2c2e' : '#e0e0e0' }]}>
        <TouchableOpacity style={[styles.addToCartButton, { backgroundColor: theme.purple }]}>
          <ShoppingCart color="#fff" size={20} strokeWidth={2} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buyNowButton, { backgroundColor: theme.purple, opacity: 0.9 }]}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 68,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  productInfoSection: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 30,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  sellerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8d5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  sellerRating: {
    fontSize: 14,
    fontWeight: '600',
  },
  sellerReviews: {
    fontSize: 13,
  },
  sellerProducts: {
    fontSize: 13,
  },
  viewProfile: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 13,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreSection: {
    marginBottom: 80,
  },
  moreProducts: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  moreProductCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    padding: 10,
  },
  moreProductImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  moreProductName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 16,
  },
  moreProductPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
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
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});