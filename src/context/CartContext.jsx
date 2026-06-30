import React, { createContext, useState, useEffect } from 'react';
import { loadState, saveState } from '../utils/helpers';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => loadState('cart_items', []));

  useEffect(() => {
    saveState('cart_items', cartItems);
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    const cartItemId = product.id + (product.cuttingType ? `-${product.cuttingType.replace(/\s+/g, '')}` : '');
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => (item.cartItemId || item.id) === cartItemId);
      if (existingItem) {
        return prevItems.map((item) =>
          (item.cartItemId || item.id) === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, cartItemId, quantity }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => (item.cartItemId || item.id) !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item.cartItemId || item.id) === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Default delivery fee: ₹30, free over ₹500
  const deliveryFee = cartTotal > 500 || cartTotal === 0 ? 0 : 30;
  const orderTotal = cartTotal + deliveryFee;

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    deliveryFee,
    orderTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
