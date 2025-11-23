import { useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useCart } from '../../contexts/CartContext';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const router = useRouter();
  const theme = Colors.light;

  const renderCartItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.cartItem, { borderTopWidth: index === 0 ? 0 : 1, borderColor: theme.surface }]}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.productPrice, { color: theme.purple }]}>₦{item.price.toLocaleString()}</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
            <Minus size={16} color={theme.purple} />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: theme.text }]}>{item.quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
            <Plus size={16} color={theme.purple} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
        <Trash2 size={20} color={'#e74c3c'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <ShoppingCart size={80} color={theme.secondaryText} strokeWidth={1} />
          <Text style={[styles.emptyCartText, { color: theme.secondaryText }]}>Your cart is empty</Text>
          <TouchableOpacity style={[styles.shopNowButton, { backgroundColor: theme.purple }]} onPress={() => router.push('/(app)/(tabs)/shop')}>
            <Text style={styles.shopNowButtonText}>Shop Now</Text>
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
          />
          <View style={[styles.footer, { borderTopColor: theme.surface }]}>
            <View style={styles.totalContainer}>
              <Text style={[styles.totalText, { color: theme.secondaryText }]}>Total</Text>
              <Text style={[styles.totalAmount, { color: theme.text }]}>₦{getCartTotal().toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={[styles.checkoutButton, { backgroundColor: theme.purple }]}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 17,
    marginTop: 20,
    marginBottom: 24,
  },
  shopNowButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  shopNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cartList: {
    paddingHorizontal: 24,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    marginVertical: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  removeButton: {
    padding: 8,
    marginLeft: 16,
  },
  footer: {
    borderTopWidth: 1,
    padding: 24,
    paddingBottom: 32,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  checkoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
});