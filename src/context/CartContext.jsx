import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper function to create unique cart item ID
const getCartItemId = (coffeeId, size, roast) => {
  return `${coffeeId}_${size}_${roast}`;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    const savedUserId = localStorage.getItem('cartUserId');
    const currentUserId = localStorage.getItem('currentUserId');

    // Clear cart if user changed
    if (savedUserId !== currentUserId) {
      localStorage.removeItem('cart');
      localStorage.setItem('cartUserId', currentUserId || '');
      return [];
    }

    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      localStorage.setItem('cartUserId', currentUserId);
    }
  }, [cartItems]);

  const addToCart = (coffee, selectedSize, selectedRoast) => {
    setCartItems(prevItems => {
      const cartItemId = getCartItemId(coffee.id, selectedSize?.size, selectedRoast);

      // Find existing item with same coffee, size, and roast
      const existingItem = prevItems.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        return prevItems.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }

      return [...prevItems, {
        ...coffee,
        cartItemId,
        selectedSize,
        selectedRoast,
        cartQuantity: 1
      }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, cartQuantity: quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    localStorage.removeItem('cartUserId');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.selectedSize?.price || item.price || 0;
      return total + (price * item.cartQuantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.cartQuantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
