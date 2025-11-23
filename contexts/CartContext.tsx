// contexts/CartContext.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      if (currentUser) {
        setLoading(true);
        const cartDocRef = doc(db, 'carts', currentUser.id);
        const cartDoc = await getDoc(cartDocRef);
        if (cartDoc.exists()) {
          setCartItems(cartDoc.data().items || []);
        } else {
          setCartItems([]);
        }
        setLoading(false);
      } else {
        setCartItems([]);
        setLoading(false);
      }
    };

    fetchCart();
  }, [currentUser]);

  const updateCartInFirestore = async (items: CartItem[]) => {
    if (currentUser) {
      const cartDocRef = doc(db, 'carts', currentUser.id);
      await setDoc(cartDocRef, { items });
    }
  };

  const addToCart = async (product: Omit<CartItem, 'quantity'>) => {
    const newCartItems = [...cartItems];
    const existingItemIndex = newCartItems.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      newCartItems[existingItemIndex].quantity += 1;
    } else {
      newCartItems.push({ ...product, quantity: 1 });
    }

    setCartItems(newCartItems);
    await updateCartInFirestore(newCartItems);
  };

  const removeFromCart = async (productId: string) => {
    const newCartItems = cartItems.filter((item) => item.id !== productId);
    setCartItems(newCartItems);
    await updateCartInFirestore(newCartItems);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const newCartItems = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCartItems(newCartItems);
    await updateCartInFirestore(newCartItems);
  };

  const clearCart = async () => {
    setCartItems([]);
    await updateCartInFirestore([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};