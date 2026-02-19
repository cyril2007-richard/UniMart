import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  ReceiptText, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  Package, 
  Truck, 
  User, 
  CheckCircle2, 
  Clock, 
  MapPin,
  Bike,
  ShieldCheck,
  ChevronDown,
  Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, increment, getDocs, writeBatch } from 'firebase/firestore';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';

const { width } = Dimensions.get('window');

const TRACKING_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Clock, color: '#94A3B8' },
  { id: 'rider_assigned', label: 'Rider Assigned', icon: User, color: '#2563EB' },
  { id: 'in_transit', label: 'In Transit', icon: Bike, color: '#F59E0B' },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2, color: '#16A34A' },
];

export default function ReceiptsScreen() {
  const theme = Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeDispatches, setActiveDispatches] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'receipts'),
      where('buyerId', '==', currentUser.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReceipts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReceipts(fetchedReceipts);
      
      // Filter active dispatches for the notification banner
      const active = fetchedReceipts.filter(r => 
        ['rider_assigned', 'in_transit', 'picked_up'].includes(r.status)
      );
      setActiveDispatches(active);

      // Update selected receipt if it's open
      if (selectedReceipt) {
        const updated = fetchedReceipts.find(r => r.id === selectedReceipt.id);
        if (updated) setSelectedReceipt(updated);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error listening to receipts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIndex = (status: string) => {
    const idx = TRACKING_STEPS.findIndex(s => s.id === status);
    return idx === -1 ? 0 : idx;
  };

  const settleFunds = async (receipt: any) => {
    try {
      const batch = writeBatch(db);
      
      // 1. Find all payments associated with this receipt
      // We'll query by buyerId and createdAt (within a small window) since we don't have receiptId in payments yet
      // In a real app, you'd have a receiptId in the payment doc
      const paymentsQ = query(
        collection(db, 'payments'),
        where('buyerId', '==', currentUser?.id),
        where('status', '==', 'completed') // They are initially 'completed' but we want to move funds
      );
      
      const paymentsSnap = await getDocs(paymentsQ);
      
      // Filter for payments that match this receipt's items/amounts (approximation for demo)
      const relevantPayments = paymentsSnap.docs.filter(doc => {
        const data = doc.data();
        // Check if sellerId is in the receipt's items or if the amount matches one of the seller totals
        return receipt.items.some((item: any) => item.sellerId === data.sellerId);
      });

      for (const pDoc of relevantPayments) {
        const pData = pDoc.data();
        const sellerId = pData.sellerId;
        const amount = pData.amount; // This is the seller's portion

        // Update Merchant Balance
        const merchantRef = doc(db, 'merchants', sellerId);
        batch.update(merchantRef, {
          pendingBalance: increment(-amount),
          availableBalance: increment(amount)
        });
      }

      await batch.commit();
      Alert.alert('Funds Released', 'The order is delivered. Funds have been moved from Escrow to the Seller\'s available balance.');
    } catch (error) {
      console.error('Settlement error:', error);
    }
  };

  const renderReceiptItem = ({ item }: { item: any }) => {
    const statusIdx = getStatusIndex(item.status || 'pending');
    const currentStep = TRACKING_STEPS[statusIdx];

    return (
      <TouchableOpacity 
        style={[styles.receiptCard, { backgroundColor: theme.surface }]}
        onPress={() => setSelectedReceipt(item)}
        activeOpacity={0.7}
      >
        <View style={styles.receiptHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.secondaryBackground }]}>
            <ReceiptText size={20} color={theme.primary} />
          </View>
          <View style={styles.receiptHeaderText}>
            <Text style={[styles.receiptTitle, { color: theme.text }]}>Order #{item.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={[styles.receiptDate, { color: theme.secondaryText }]}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={[styles.receiptAmount, { color: theme.text }]}>₦{item.totalAmount.toLocaleString()}</Text>
        </View>
        
        <View style={styles.receiptFooter}>
          <View style={[styles.statusTag, { backgroundColor: currentStep.color + '15' }]}>
            <currentStep.icon size={12} color={currentStep.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: currentStep.color }]}>{currentStep.label.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <ChevronRight size={18} color={theme.mutedText} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTrackingTimeline = () => {
    if (!selectedReceipt) return null;
    const currentIdx = getStatusIndex(selectedReceipt.status || 'pending');

    return (
      <View style={styles.trackingContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 20 }]}>Live Status</Text>
        <View style={styles.timeline}>
          {TRACKING_STEPS.map((step, index) => {
            const isCompleted = index <= currentIdx;
            const isLast = index === TRACKING_STEPS.length - 1;
            const StepIcon = step.icon;

            return (
              <View key={step.id} style={styles.timelineStep}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot, 
                    { backgroundColor: isCompleted ? step.color : '#E2E8F0' }
                  ]}>
                    {isCompleted ? <CheckCircle2 size={14} color="white" /> : <View style={styles.dotInner} />}
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.timelineLine, 
                      { backgroundColor: index < currentIdx ? step.color : '#E2E8F0' }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={[
                    styles.stepLabel, 
                    { color: isCompleted ? theme.text : theme.mutedText, fontWeight: isCompleted ? '700' : '500' }
                  ]}>
                    {step.label}
                  </Text>
                  {index === currentIdx && (
                    <Text style={[styles.stepDesc, { color: theme.secondaryText }]}>
                      {index === 0 && "We've received your order."}
                      {index === 1 && `${selectedReceipt.riderName || 'Rider'} has accepted the order.`}
                      {index === 2 && `${selectedReceipt.riderName || 'Rider'} is on the way to you.`}
                      {index === 3 && "Package delivered successfully. Awaiting your confirmation."}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {selectedReceipt.confirmationCode && currentIdx < 3 && (
          <View style={styles.codeCard}>
            <Text style={styles.codeCardTitle}>Confirmation Code</Text>
            <Text style={styles.codeCardValue}>{selectedReceipt.confirmationCode}</Text>
            <Text style={styles.codeCardInstruction}>Share this code with your rider upon delivery</Text>
          </View>
        )}
        
        {selectedReceipt.status === 'delivered' && (
          <TouchableOpacity
            style={styles.confirmDeliveryButton}
            onPress={() => Alert.alert("Confirm Delivery", "Are you sure you have received your package?", [
              {text: "Cancel"},
              {text: "Yes, I have", onPress: () => {
                // Here you would update the status to 'completed'
                const receiptRef = doc(db, 'receipts', selectedReceipt.id);
                updateDoc(receiptRef, { status: 'completed' });
                // Also update order if needed
              }}
            ])}
          >
            <ShieldCheck size={20} color="white" />
            <Text style={styles.confirmDeliveryButtonText}>Confirm Delivery</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Receipts</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : receipts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
            <ReceiptText size={40} color={theme.mutedText} />
          </View>
          <Text style={[styles.emptyText, { color: theme.text }]}>No receipts found</Text>
          <Text style={[styles.emptySub, { color: theme.secondaryText }]}>Your purchase history will appear here once you make a purchase.</Text>
        </View>
      ) : (
        <FlatList
          data={receipts}
          renderItem={renderReceiptItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Invoice Modal */}
      <Modal
        visible={!!selectedReceipt}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedReceipt(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <TouchableOpacity onPress={() => setSelectedReceipt(null)} style={styles.modalCloseIcon}>
                  <ChevronDown size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Order Details</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: TRACKING_STEPS[getStatusIndex(selectedReceipt?.status || 'pending')].color + '15' }]}>
                <Text style={[styles.statusBadgeText, { color: TRACKING_STEPS[getStatusIndex(selectedReceipt?.status || 'pending')].color }]}>
                  {(selectedReceipt?.status || 'pending').replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            {selectedReceipt && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.invoiceContainer}>
                
                {renderTrackingTimeline()}

                <View style={[styles.invoiceCard, { backgroundColor: theme.surface, marginTop: 24 }]}>
                  <View style={styles.invoiceTop}>
                    <Text style={[styles.invoiceBrand, { color: theme.primary }]}>UniMart</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.invoiceId, { color: theme.secondaryText }]}>Order Hash:</Text>
                      <Text style={[styles.invoiceIdVal, { color: theme.text, fontSize: 10, fontStyle: 'italic' }]}>{selectedReceipt.id.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: theme.secondaryBackground, marginVertical: 20 }]} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Date</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>{formatDate(selectedReceipt.createdAt)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Method</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>{selectedReceipt.paymentMethod.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: theme.secondaryBackground, marginVertical: 20 }]} />

                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Market Basket</Text>
                  {selectedReceipt.items.map((item: any, index: number) => (
                    <View key={index} style={styles.invoiceItemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.itemQty, { color: theme.secondaryText }]}>Qty: {item.quantity} • ₦{item.price.toLocaleString()}</Text>
                      </View>
                      <Text style={[styles.itemTotal, { color: theme.text }]}>₦{(item.price * item.quantity).toLocaleString()}</Text>
                    </View>
                  ))}

                  <View style={[styles.divider, { backgroundColor: theme.secondaryBackground, marginTop: 20, marginBottom: 16 }]} />

                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Basket Value</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>₦{selectedReceipt.subtotal.toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Protocol Fee</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>₦{(selectedReceipt.serviceFee || 0).toLocaleString()}</Text>
                  </View>
                  <View style={[styles.summaryRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f1f1' }]}>
                    <Text style={[styles.grandTotalLabel, { color: theme.text }]}>Net Settlement</Text>
                    <Text style={[styles.grandTotalValue, { color: theme.primary }]}>₦{selectedReceipt.totalAmount.toLocaleString()}</Text>
                  </View>
                  
                  <View style={styles.invoiceFooter}>
                    <ShieldCheck size={20} color={theme.success} style={{ marginBottom: 8 }} />
                    <Text style={[styles.footerText, { color: theme.text }]}>Secured by Endow Protocol</Text>
                    <Text style={[styles.footerSubText, { color: theme.secondaryText }]}>Transaction verified on campus ledger.</Text>
                  </View>
                </View>
                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  
  receiptCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  receiptHeaderText: { flex: 1 },
  receiptTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  receiptDate: { fontSize: 12 },
  receiptAmount: { fontSize: 16, fontWeight: '800' },
  
  receiptFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8 
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyText: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { height: '90%', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalCloseIcon: { padding: 4 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '900' },

  // Tracking
  trackingContainer: { padding: 4 },
  timeline: { paddingLeft: 8 },
  timelineStep: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: 16 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' },
  timelineLine: { position: 'absolute', top: 24, bottom: -20, width: 2, left: 11 },
  timelineRight: { flex: 1, paddingTop: 2 },
  stepLabel: { fontSize: 15 },
  stepDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  
  simulateBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    paddingVertical: 12, 
    borderRadius: 14, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)'
  },
  simulateBtnText: { fontWeight: '700', fontSize: 14 },

  codeCard: {
    marginTop: 24,
    backgroundColor: '#111827', // Dark blue/grey
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  codeCardTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeCardValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 8,
  },
  codeCardInstruction: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
  },

  confirmDeliveryButton: {
    marginTop: 24,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  confirmDeliveryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  // Invoice
  invoiceContainer: { paddingBottom: 30 },
  invoiceCard: { borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  invoiceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  invoiceBrand: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  invoiceId: { fontSize: 10, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase' },
  invoiceIdVal: { fontSize: 11, fontWeight: '600' },
  
  detailsGrid: { flexDirection: 'row', marginBottom: 0 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', opacity: 0.5 },
  detailValue: { fontSize: 13, fontWeight: '700' },
  
  divider: { height: 1, opacity: 0.5 },
  
  sectionTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  invoiceItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemInfo: { flex: 1, marginRight: 16 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemQty: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  itemTotal: { fontSize: 14, fontWeight: '800' },
  
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 13, fontWeight: '600' },
  summaryValue: { fontSize: 13, fontWeight: '700' },
  grandTotalLabel: { fontSize: 16, fontWeight: '900' },
  grandTotalValue: { fontSize: 20, fontWeight: '900' },
  
  invoiceFooter: { marginTop: 32, alignItems: 'center', opacity: 0.8 },
  footerText: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  footerSubText: { fontSize: 11, fontWeight: '500' },

  dispatchBannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  dispatchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dispatchBannerTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  dispatchBannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
});