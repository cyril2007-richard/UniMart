import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bike, Building2, CheckCircle2, Copy, CreditCard, LocateFixed, MapPin, Phone, ShieldCheck, Truck, User, LogIn } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Colors from '../constants/Colors';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { db } from '../firebase';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();
  const theme = Colors.light;

  if (!currentUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', gap: 20 }]}>
        <LogIn size={64} color={theme.secondaryText} />
        <Text style={{ color: theme.text, fontSize: 18, textAlign: 'center' }}>
          You must be logged in to checkout.
        </Text>
        <TouchableOpacity 
          style={[styles.payButton, { backgroundColor: theme.purple, width: 'auto', paddingHorizontal: 40 }]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.payButtonText}>Login Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Parse single buy now item if present
  const buyNowItem = params.buyNowItem ? JSON.parse(params.buyNowItem as string) : null;
  
  const [deliveryMethod, setDeliveryMethod] = useState<'rider' | 'pickup'>('rider');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(500);

  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setDeliveryFee(0);
    } else {
      setDeliveryFee(500); // Flat rate for now
    }
  }, [deliveryMethod]);

  const itemsToCheckout = buyNowItem ? [buyNowItem] : cartItems.filter(item => item.selected);
  const subtotal = buyNowItem 
    ? buyNowItem.price 
    : itemsToCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const grandTotal = subtotal + deliveryFee;

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Bank details copied to clipboard');
  };

  const handleUseLocation = async () => {
    Alert.alert(
      "Allow Location Access",
      "UniMart uses your location to help the rider find your hostel/room for delivery.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            setIsLocating(true);
            try {
              let { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                setIsLocating(false);
                return;
              }

              let location = await Location.getCurrentPositionAsync({});
              let addressResponse = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              });

              if (addressResponse.length > 0) {
                const addr = addressResponse[0];
                // Construct a readable address string
                const formattedAddress = [
                  addr.name,
                  addr.street,
                  addr.city,
                  addr.region
                ].filter(Boolean).join(', ');
                
                setAddress(formattedAddress);
              }            } catch (error) {
              Alert.alert('Error', 'Could not fetch location');
              console.error(error);
            } finally {
              setIsLocating(false);
            }
          }
        }
      ]
    );
  };

  const handlePayment = async () => {
    if (deliveryMethod === 'rider' && !address.trim()) {
      Alert.alert('Address Required', 'Please enter your delivery address (Hostel/Room No).');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      // Notify Buyer
      if (deliveryMethod === 'rider') {
          addNotification(
              'Payment Successful! Your rider (Mike) is on the way. Contact: 08123456789',
              'success'
          );
      } else {
          addNotification(
              'Payment Successful! Please proceed to the pickup location.',
              'success'
          );
      }

      // Notify Sellers
      const itemsBySeller: { [key: string]: any[] } = {};
      itemsToCheckout.forEach((item: any) => {
          if (!itemsBySeller[item.sellerId]) {
              itemsBySeller[item.sellerId] = [];
          }
          itemsBySeller[item.sellerId].push(item);
      });

      // Send notification to each seller
      for (const sellerId in itemsBySeller) {
          const sellerItems = itemsBySeller[sellerId];
          const itemNames = sellerItems.map(i => i.name || i.title).join(', ');
          const totalAmount = sellerItems.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
          
          try {
              const notificationsRef = collection(db, 'users', sellerId, 'notifications');
              await addDoc(notificationsRef, {
                  message: `New Order! ${currentUser?.name || 'A buyer'} paid ₦${totalAmount.toLocaleString()} for: ${itemNames}.`,
                  type: 'success',
                  read: false,
                  createdAt: serverTimestamp()
              });
          } catch (error) {
              console.error(`Failed to notify seller ${sellerId}`, error);
          }
      }

      setIsProcessing(false);

      if (!buyNowItem) {
        await clearCart(); // Only clear cart if it was a cart checkout
      }
      router.replace('/payment-success');
    }, 2000);
  };

  const renderPaymentContent = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <View style={styles.cardForm}>
            <TextInput 
              placeholder="Card Number" 
              placeholderTextColor={theme.tabIconDefault}
              style={[styles.input, { borderColor: theme.surface, marginBottom: 12 }]}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <TextInput 
                placeholder="MM/YY" 
                placeholderTextColor={theme.tabIconDefault}
                style={[styles.input, { borderColor: theme.surface, flex: 1, marginRight: 8 }]}
                keyboardType="numeric"
              />
              <TextInput 
                placeholder="CVV" 
                placeholderTextColor={theme.tabIconDefault}
                style={[styles.input, { borderColor: theme.surface, flex: 1, marginLeft: 8 }]}
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
        );
      case 'transfer':
        return (
          <View style={[styles.transferBox, { backgroundColor: theme.surface }]}>
            <View style={styles.transferRow}>
              <Text style={[styles.transferLabel, { color: theme.secondaryText }]}>Bank Name</Text>
              <Text style={[styles.transferValue, { color: theme.text }]}>UniMart Bank</Text>
            </View>
            <View style={[styles.transferRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.transferLabel, { color: theme.secondaryText }]}>Account Number</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.transferValue, { color: theme.text, marginRight: 8 }]}>1234567890</Text>
                <TouchableOpacity onPress={() => handleCopy('1234567890')}>
                  <Copy size={16} color={theme.purple} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.transferNote, { color: theme.purple }]}>
              Please use your Order ID as the payment reference.
            </Text>
          </View>
        );
      case 'ussd':
        return (
          <View style={[styles.ussdBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.ussdCode, { color: theme.text }]}>*894*000*543#</Text>
            <TouchableOpacity style={[styles.dialButton, { borderColor: theme.purple }]}>
              <Text style={[styles.dialText, { color: theme.purple }]}>Tap to Dial</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color={theme.purple} />
            <Text style={[styles.title, { color: theme.text }]}>Secure Checkout</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* 1. Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            {itemsToCheckout.map((item: any, index: number) => (
              <View key={index} style={[styles.orderItem, index !== itemsToCheckout.length - 1 && { borderBottomColor: theme.background, borderBottomWidth: 1 }]}>
                <Image source={{ uri: item.image || item.images?.[0] }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text numberOfLines={1} style={[styles.itemName, { color: theme.text }]}>{item.name || item.title}</Text>
                  <Text style={[styles.itemMeta, { color: theme.secondaryText }]}>Qty: {item.quantity || 1}</Text>
                </View>
                <Text style={[styles.itemPrice, { color: theme.text }]}>₦{(item.price * (item.quantity || 1)).toLocaleString()}</Text>
              </View>
            ))}
            <View style={[styles.subtotalRow, { borderTopColor: theme.background }]}>
                <Text style={{ color: theme.secondaryText }}>Subtotal</Text>
                <Text style={{ color: theme.text, fontWeight: '600' }}>₦{subtotal.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* 2. Delivery Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Method</Text>
          
          <View style={styles.methodGroup}>
            <TouchableOpacity 
                style={[
                    styles.methodCard, 
                    { backgroundColor: theme.surface, borderColor: deliveryMethod === 'rider' ? theme.purple : 'transparent', borderWidth: 2 }
                ]}
                onPress={() => setDeliveryMethod('rider')}
            >
                <Bike size={24} color={deliveryMethod === 'rider' ? theme.purple : theme.tabIconDefault} />
                <Text style={[styles.methodTitle, { color: theme.text }]}>UniMart Rider</Text>
                <Text style={[styles.methodPrice, { color: theme.purple }]}>+₦500</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[
                    styles.methodCard, 
                    { backgroundColor: theme.surface, borderColor: deliveryMethod === 'pickup' ? theme.purple : 'transparent', borderWidth: 2 }
                ]}
                onPress={() => setDeliveryMethod('pickup')}
            >
                <User size={24} color={deliveryMethod === 'pickup' ? theme.purple : theme.tabIconDefault} />
                <Text style={[styles.methodTitle, { color: theme.text }]}>Self Pickup</Text>
                <Text style={[styles.methodPrice, { color: theme.purple }]}>Free</Text>
            </TouchableOpacity>
          </View>

          {deliveryMethod === 'rider' && (
              <View style={[styles.addressInputContainer, { backgroundColor: theme.surface }]}>
                  <MapPin size={20} color={theme.secondaryText} style={{ marginRight: 10 }} />
                  <TextInput
                    placeholder="Enter Hostel & Room Number"
                    placeholderTextColor={theme.secondaryText}
                    style={[styles.addressInput, { color: theme.text }]}
                    value={address}
                    onChangeText={setAddress}
                  />
                  <TouchableOpacity onPress={handleUseLocation} disabled={isLocating} style={{ padding: 8 }}>
                    {isLocating ? (
                      <ActivityIndicator size="small" color={theme.purple} />
                    ) : (
                      <LocateFixed size={20} color={theme.purple} />
                    )}
                  </TouchableOpacity>
              </View>
          )}
           {deliveryMethod === 'pickup' && (
              <View style={[styles.pickupNote, { backgroundColor: '#e8f4fd' }]}>
                  <Text style={{ color: '#0d47a1', fontSize: 13 }}>You will meet the seller at an agreed location on campus.</Text>
              </View>
          )}
        </View>

        {/* 3. Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
          
          <View style={[styles.paymentTabs, { backgroundColor: theme.surface }]}>
            <TouchableOpacity 
                style={[styles.paymentTab, paymentMethod === 'card' && { backgroundColor: theme.purple }]}
                onPress={() => setPaymentMethod('card')}
            >
                <CreditCard size={20} color={paymentMethod === 'card' ? 'white' : theme.secondaryText} />
                <Text style={[styles.paymentTabText, { color: paymentMethod === 'card' ? 'white' : theme.secondaryText }]}>Card</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.paymentTab, paymentMethod === 'transfer' && { backgroundColor: theme.purple }]}
                onPress={() => setPaymentMethod('transfer')}
            >
                <Building2 size={20} color={paymentMethod === 'transfer' ? 'white' : theme.secondaryText} />
                <Text style={[styles.paymentTabText, { color: paymentMethod === 'transfer' ? 'white' : theme.secondaryText }]}>Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.paymentTab, paymentMethod === 'ussd' && { backgroundColor: theme.purple }]}
                onPress={() => setPaymentMethod('ussd')}
            >
                <Phone size={20} color={paymentMethod === 'ussd' ? 'white' : theme.secondaryText} />
                <Text style={[styles.paymentTabText, { color: paymentMethod === 'ussd' ? 'white' : theme.secondaryText }]}>USSD</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentContent}>
            {renderPaymentContent()}
          </View>
        </View>

        {/* 4. Bill Breakdown */}
        <View style={[styles.billSection, { backgroundColor: theme.surface }]}>
            <View style={styles.billRow}>
                <Text style={{ color: theme.secondaryText }}>Item Total</Text>
                <Text style={{ color: theme.text }}>₦{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.billRow}>
                <Text style={{ color: theme.secondaryText }}>Delivery Fee</Text>
                <Text style={{ color: theme.text }}>₦{deliveryFee.toLocaleString()}</Text>
            </View>
            <View style={[styles.billRow, styles.totalRow, { borderTopColor: theme.background }]}>
                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18 }}>Grand Total</Text>
                <Text style={{ color: theme.purple, fontWeight: 'bold', fontSize: 20 }}>₦{grandTotal.toLocaleString()}</Text>
            </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.surface }]}>
        <TouchableOpacity 
            style={[styles.payButton, { backgroundColor: theme.purple }]}
            onPress={handlePayment}
            disabled={isProcessing}
        >
            {isProcessing ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.payButtonText}>Pay ₦{grandTotal.toLocaleString()}</Text>
            )}
        </TouchableOpacity>
        <View style={styles.securityNote}>
            <ShieldCheck size={14} color={theme.secondaryText} />
            <Text style={[styles.securityText, { color: theme.secondaryText }]}>Payments secured by Paystack</Text>
        </View>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: '700' },
  content: { padding: 24 },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  
  card: { borderRadius: 12, padding: 16 },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  itemImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee' },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontWeight: '600', fontSize: 14, marginBottom: 4 },
  itemMeta: { fontSize: 12 },
  itemPrice: { fontWeight: '600', fontSize: 14 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  
  methodGroup: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  methodCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', gap: 8 },
  methodTitle: { fontSize: 13, fontWeight: '600' },
  methodPrice: { fontSize: 12, fontWeight: '700' },
  
  addressInputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  addressInput: { flex: 1, fontSize: 15 },
  pickupNote: { padding: 12, borderRadius: 8 },

  paymentTabs: { flexDirection: 'row', padding: 4, borderRadius: 12, marginBottom: 16 },
  paymentTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
  paymentTabText: { fontSize: 13, fontWeight: '600' },
  paymentContent: { minHeight: 100 },
  
  cardForm: {},
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15 },
  row: { flexDirection: 'row' },
  
  transferBox: { padding: 20, borderRadius: 12 },
  transferRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  transferLabel: { fontSize: 14 },
  transferValue: { fontSize: 15, fontWeight: '600' },
  transferNote: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  
  ussdBox: { padding: 24, borderRadius: 12, alignItems: 'center', gap: 16 },
  ussdCode: { fontSize: 24, fontWeight: '700', letterSpacing: 1 },
  dialButton: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1.5 },
  dialText: { fontWeight: '600' },

  billSection: { padding: 20, borderRadius: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 4, marginBottom: 0 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 32, borderTopWidth: 1 },
  payButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  payButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  securityNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  securityText: { fontSize: 12 },
});