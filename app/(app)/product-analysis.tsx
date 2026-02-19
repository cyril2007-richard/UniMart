import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ArrowLeft, BarChart3, MessageSquare, ShoppingCart, Star, TrendingUp, Users, AlertTriangle } from 'lucide-react-native';
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { db } from '../../firebase';
import { useListings, type Listing } from '../../contexts/ListingsContext';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface Review { 
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: any;
}

export default function ProductAnalysisScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors.light;
  const { listings } = useListings();
  const { currentUser } = useAuth();
  
  const product = useMemo(() => listings.find(l => l.id === id), [listings, id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    uniqueBuyers: 0,
  });

  const fetchAnalysisData = async () => {
    if (!id || !currentUser) return;
    setLoading(true);
    setError(null);
    
    // 1. Fetch Reviews
    try {
      const reviewsRef = collection(db, 'listings', id as string, 'reviews');
      const reviewsSnap = await getDocs(query(reviewsRef, orderBy('createdAt', 'desc')));
      const reviewsData = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(reviewsData);
    } catch (err: any) {
      console.warn("Permission Error (Reviews):", err.message);
      // We don't fail the whole page for reviews
    }

    // 2. Fetch Sales (Subcollection of listing)
    try {
      if (product) {
          const salesRef = collection(db, 'listings', id as string, 'sales');
          const salesSnap = await getDocs(query(salesRef, orderBy('createdAt', 'desc')));
          
          let salesCount = 0;
          let revenue = 0;
          const buyers = new Set<string>();

          salesSnap.docs.forEach(doc => {
              const data = doc.data();
              const qty = data.quantity || 1;
              salesCount += qty;
              revenue += (data.price * qty);
              if (data.buyerId) buyers.add(data.buyerId);
          });

          setStats({
              totalSales: salesCount,
              totalRevenue: revenue,
              uniqueBuyers: buyers.size
          });
      }
    } catch (err: any) {
      console.error("Permission Error (Sales):", err.message);
      setError("Insufficient permissions to view sales data. Please ensure you are the owner of this listing and have verification privileges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisData();
  }, [id, product, currentUser]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 12, color: theme.secondaryText, fontWeight: '500' }}>Loading insights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background, padding: 40 }]}>
        <AlertTriangle size={48} color={theme.error} />
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>Permission Error</Text>
        <Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            {error.includes('permissions') 
                ? "You don't have permission to access transaction records. Please contact support if you are the owner of this product."
                : error}
        </Text>
        <TouchableOpacity 
            onPress={fetchAnalysisData} 
            style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 24 }]}
        >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: theme.secondaryText, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Product not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Product Insights</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Product Brief */}
        <View style={[styles.card, styles.productBrief]}>
            <Image source={{ uri: product.images[0] }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <Text numberOfLines={1} style={[styles.productTitle, { color: theme.text }]}>{product.title}</Text>
                <Text style={[styles.productPrice, { color: theme.secondaryText }]}>₦{product.price.toLocaleString()}</Text>
                <View style={styles.statusBadge}>
                    <View style={[styles.dot, { backgroundColor: theme.success }]} />
                    <Text style={[styles.statusText, { color: theme.success }]}>Active Listing</Text>
                </View>
            </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
            <StatCard 
                icon={<TrendingUp size={20} color={theme.primary} />}
                label="Revenue"
                value={`₦${stats.totalRevenue.toLocaleString()}`}
                color={theme.primary}
            />
            <StatCard 
                icon={<ShoppingCart size={20} color="#16A34A" />}
                label="Sales"
                value={stats.totalSales.toString()}
                color="#16A34A"
            />
            <StatCard 
                icon={<Users size={20} color="#F59E0B" />}
                label="Buyers"
                value={stats.uniqueBuyers.toString()}
                color="#F59E0B"
            />
            <StatCard 
                icon={<Star size={20} color="#EA580C" />}
                label="Rating"
                value={averageRating}
                color="#EA580C"
            />
        </View>

        {/* Sales Performance Chart Placeholder (Fintech look) */}
        <View style={[styles.card, styles.performanceCard]}>
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                    <BarChart3 size={18} color={theme.text} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Performance</Text>
                </View>
                <Text style={[styles.timeRange, { color: theme.mutedText }]}>All time</Text>
            </View>
            <View style={styles.chartPlaceholder}>
                <View style={[styles.bar, { height: '40%', backgroundColor: theme.secondaryBackground }]} />
                <View style={[styles.bar, { height: '60%', backgroundColor: theme.secondaryBackground }]} />
                <View style={[styles.bar, { height: '45%', backgroundColor: theme.secondaryBackground }]} />
                <View style={[styles.bar, { height: '80%', backgroundColor: theme.primary }]} />
                <View style={[styles.bar, { height: '55%', backgroundColor: theme.secondaryBackground }]} />
                <View style={[styles.bar, { height: '70%', backgroundColor: theme.secondaryBackground }]} />
                <View style={[styles.bar, { height: '30%', backgroundColor: theme.secondaryBackground }]} />
            </View>
            <Text style={[styles.chartNote, { color: theme.mutedText }]}>Consistent growth in sales over the last 30 days.</Text>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                    <MessageSquare size={18} color={theme.text} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Reviews ({reviews.length})</Text>
                </View>
            </View>

            {reviews.length === 0 ? (
                <View style={[styles.card, styles.emptyReviews]}>
                    <Text style={{ color: theme.secondaryText }}>No reviews yet for this product.</Text>
                </View>
            ) : (
                reviews.map((item) => (
                    <View key={item.id} style={[styles.card, styles.reviewCard]}>
                        <View style={styles.reviewHeader}>
                            <Text style={[styles.reviewerName, { color: theme.text }]}>{item.userName}</Text>
                            <View style={styles.ratingStars}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star 
                                        key={s} 
                                        size={12} 
                                        fill={s <= item.rating ? "#F59E0B" : "none"} 
                                        color="#F59E0B" 
                                    />
                                ))}
                            </View>
                        </View>
                        <Text style={[styles.reviewComment, { color: theme.secondaryText }]}>{item.comment}</Text>
                        <Text style={[styles.reviewDate, { color: theme.mutedText }]}>
                            {item.createdAt?.toDate().toLocaleDateString() || "Recently"}
                        </Text>
                    </View>
                ))
            )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color }: any) {
    const theme = Colors.light;
    return (
        <View style={[styles.card, styles.statCard]}>
            <View style={[styles.statIconCircle, { backgroundColor: color + '10' }]}>
                {icon}
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.mutedText }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  scrollContent: { padding: 20 },

  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  // Product Brief
  productBrief: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F1F5F9',
  },
  productInfo: { flex: 1 },
  productTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  productPrice: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    padding: 20,
    alignItems: 'flex-start',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Performance Card
  performanceCard: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeRange: { fontSize: 12, fontWeight: '600' },
  chartPlaceholder: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  chartNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  primaryButton: {

  },

  // Reviews
  reviewsSection: {
    marginTop: 8,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  reviewCard: {
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: { fontSize: 14, fontWeight: '700' },
  ratingStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  reviewDate: { fontSize: 11, fontWeight: '500' },
});
