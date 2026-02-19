import { useRouter } from 'expo-router';
import { Check, ChevronLeft, LogIn, Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, toggleSelection, toggleAllSelection } = useCart();
  const { currentUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors.light;

  const allSelected = useMemo(() => cartItems.length > 0 && cartItems.every(item => item.selected), [cartItems]);
  const selectedCount = cartItems.filter(item => item.selected).length;

  // --- Auth Guard ---
  if (!currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>My Cart</Text>
            <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.centerContent}>
            <View style={[styles.iconCircle, { backgroundColor: theme.secondaryBackground }]}>
                <LogIn size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Log in to View Cart</Text>
            <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
                Sign in to see your saved items and continue shopping.
            </Text>
            <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.9}
            >
                <Text style={styles.primaryButtonText}>Login or Sign Up</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Render Item ---
  const renderCartItem = ({ item }: { item: any }) => (
    <View style={[styles.cartItem, { backgroundColor: theme.surface, borderColor: theme.secondaryBackground }]}>
      
      {/* Checkbox */}
      <TouchableOpacity 
        onPress={() => toggleSelection(item.id)} 
        activeOpacity={0.7}
        style={[
            styles.checkbox, 
            item.selected ? { backgroundColor: theme.primary, borderColor: theme.primary } : { borderColor: theme.secondaryBackground }
        ]}
      >
        {item.selected && <Check size={14} color="white" strokeWidth={2.5} />}
      </TouchableOpacity>

      {/* Image */}
      <Image source={{ uri: item.image }} style={[styles.productImage, { backgroundColor: theme.secondaryBackground }]} />
      
      {/* Details */}
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
            <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                <Trash2 size={18} color={theme.error} />
            </TouchableOpacity>
        </View>
        
        <Text style={[styles.productPrice, { color: theme.text }]}>₦{item.price.toLocaleString()}</Text>
        
        <View style={styles.itemFooter}>
            <View style={[styles.quantityControl, { backgroundColor: theme.secondaryBackground }]}>
                <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                    <Minus size={16} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: theme.text }]}>{item.quantity}</Text>
                <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                    <Plus size={16} color={theme.text} />
                </TouchableOpacity>
            </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Cart</Text>
        {cartItems.length > 0 ? (
            <TouchableOpacity onPress={() => toggleAllSelection(!allSelected)}>
                <Text style={[styles.actionText, { color: theme.primary }]}>
                    {allSelected ? 'Deselect' : 'Select All'}
                </Text>
            </TouchableOpacity>
        ) : (
            <View style={{ width: 60 }} /> // Spacer to balance header
        )}
      </View>

      {/* Content */}
      {cartItems.length === 0 ? (
        <View style={styles.centerContent}>
          <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
             <ShoppingBag size={48} color={theme.mutedText} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your Cart is Empty</Text>
          <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
            Looks like you haven't added anything yet.
          </Text>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
            onPress={() => router.push('/(app)/(tabs)/shop')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
          
          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: '#F1F5F9' }]}>
            <View style={styles.totalRow}>
                <View>
                    <Text style={[styles.totalLabel, { color: theme.secondaryText }]}>Total</Text>
                    <Text style={[styles.totalAmount, { color: theme.text }]}>₦{getCartTotal().toLocaleString()}</Text>
                </View>
                <View style={styles.selectedInfo}>
                     <Text style={[styles.selectedText, { color: theme.mutedText }]}>
                        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                     </Text>
                </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.checkoutButton, 
                { backgroundColor: selectedCount > 0 ? theme.primary : theme.secondaryBackground }
              ]}
              disabled={selectedCount === 0}
              onPress={() => router.push('/checkout')}
              activeOpacity={0.9}
            >
              <Text style={[
                  styles.checkoutButtonText, 
                  { color: selectedCount > 0 ? 'white' : theme.mutedText }
              ]}>
                Checkout
              </Text>
              {selectedCount > 0 && <ShoppingCart size={20} color="white" />}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  actionText: { fontSize: 15, fontWeight: '600' },

  // Empty/Auth State
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 15, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },

  // Cart List
  cartList: { padding: 16 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    // Add simple shadow or border
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    height: 80, // Match image height for vertical alignment
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  removeButton: { padding: 4, marginTop: -4 },
  productPrice: { fontSize: 16, fontWeight: '700' },
  
  itemFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 2,
  },
  qtyBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'white', // Inner button contrast
    margin: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },

  // Footer
  footer: {
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: { fontSize: 14, marginBottom: 4 },
  totalAmount: { fontSize: 24, fontWeight: '700' },
  selectedInfo: { justifyContent: 'center' },
  selectedText: { fontSize: 13 },
  
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});