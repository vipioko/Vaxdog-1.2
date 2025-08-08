import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  petType?: string;
  stock?: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  petType?: string;
  stock?: number;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vaxdog-cart');
      const savedWishlist = localStorage.getItem('vaxdog-wishlist');
      
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('Loading cart from localStorage:', parsedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      }
      
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        console.log('Loading wishlist from localStorage:', parsedWishlist);
        setWishlistItems(Array.isArray(parsedWishlist) ? parsedWishlist : []);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      localStorage.removeItem('vaxdog-cart');
      localStorage.removeItem('vaxdog-wishlist');
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever cart changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      console.log('Saving cart to localStorage:', cartItems);
      localStorage.setItem('vaxdog-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  // Save to localStorage whenever wishlist changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      console.log('Saving wishlist to localStorage:', wishlistItems);
      localStorage.setItem('vaxdog-wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isInitialized]);

  const addToCart = (product: any, quantity: number = 1) => {
    console.log('Adding to cart - product:', product, 'quantity:', quantity);
    
    // Ensure we have a valid product with required fields
    if (!product || !product.id || !product.name || product.price === undefined) {
      console.error('Invalid product data:', product);
      toast.error('Invalid product data');
      return;
    }

    // Convert product ID to string to ensure consistency
    const productId = String(product.id);
    
    setCartItems(currentItems => {
      console.log('Current cart items before add:', currentItems);
      
      const existingItem = currentItems.find(item => String(item.id) === productId);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const maxStock = product.stock || 99;
        
        if (newQuantity > maxStock) {
          toast.error(`Cannot add more items. Only ${maxStock} in stock.`);
          return currentItems;
        }
        
        const updatedItems = currentItems.map(item =>
          String(item.id) === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
        
        console.log('Updated cart items:', updatedItems);
        
        toast.success(`Updated quantity in cart!`, {
          description: `${product.name} quantity updated to ${newQuantity}.`
        });
        
        return updatedItems;
      } else {
        const cartItem: CartItem = {
          id: productId,
          name: product.name,
          price: Number(product.price),
          quantity,
          imageUrl: product.imageUrl || product.image,
          petType: product.petType,
          stock: product.stock
        };
        
        console.log('Creating new cart item:', cartItem);
        
        const newItems = [...currentItems, cartItem];
        console.log('New cart items array:', newItems);
        
        toast.success(`Added to cart!`, {
          description: `${product.name} has been added to your cart.`
        });
        
        return newItems;
      }
    });
  };

  const removeFromCart = (productId: string) => {
    const stringId = String(productId);
    
    setCartItems(currentItems => {
      const item = currentItems.find(item => String(item.id) === stringId);
      const newItems = currentItems.filter(item => String(item.id) !== stringId);
      
      if (item) {
        toast.success('Item removed from cart', {
          description: `${item.name} has been removed from your cart.`
        });
      }
      
      console.log('Removed from cart, new items:', newItems);
      return newItems;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const stringId = String(productId);
    
    if (quantity <= 0) {
      removeFromCart(stringId);
      return;
    }
    
    setCartItems(currentItems => {
      const item = currentItems.find(item => String(item.id) === stringId);
      const maxStock = item?.stock || 99;
      
      if (quantity > maxStock) {
        toast.error(`Cannot add more items. Only ${maxStock} in stock.`);
        return currentItems;
      }
      
      return currentItems.map(item =>
        String(item.id) === stringId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const clearCart = () => {
    console.log('Clearing cart...');
    setCartItems([]);
    // Force immediate localStorage update
    localStorage.setItem('vaxdog-cart', JSON.stringify([]));
    toast.success('Cart cleared');
  };

  const addToWishlist = (product: any) => {
    console.log('Adding to wishlist - product:', product);
    
    // Ensure we have a valid product with required fields
    if (!product || !product.id || !product.name || product.price === undefined) {
      console.error('Invalid product data:', product);
      toast.error('Invalid product data');
      return;
    }

    // Convert product ID to string to ensure consistency
    const productId = String(product.id);
    
    setWishlistItems(currentItems => {
      console.log('Current wishlist items before add:', currentItems);
      
      const isAlreadyInWishlist = currentItems.some(item => String(item.id) === productId);
      
      if (isAlreadyInWishlist) {
        toast.info('Item already in wishlist');
        return currentItems;
      }
      
      const wishlistItem: WishlistItem = {
        id: productId,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.imageUrl || product.image,
        petType: product.petType,
        stock: product.stock
      };
      
      console.log('Creating new wishlist item:', wishlistItem);
      
      const newItems = [...currentItems, wishlistItem];
      console.log('New wishlist items array:', newItems);
      
      toast.success('Added to wishlist!', {
        description: `${product.name} has been added to your wishlist.`
      });
      
      return newItems;
    });
  };

  const removeFromWishlist = (productId: string) => {
    const stringId = String(productId);
    
    setWishlistItems(currentItems => {
      const item = currentItems.find(item => String(item.id) === stringId);
      const newItems = currentItems.filter(item => String(item.id) !== stringId);
      
      if (item) {
        toast.success('Removed from wishlist', {
          description: `${item.name} has been removed from your wishlist.`
        });
      }
      
      console.log('Removed from wishlist, new items:', newItems);
      return newItems;
    });
  };

  const moveToCart = (productId: string, quantity: number = 1) => {
    const stringId = String(productId);
    const wishlistItem = wishlistItems.find(item => String(item.id) === stringId);
    
    if (wishlistItem) {
      addToCart(wishlistItem, quantity);
      removeFromWishlist(stringId);
    }
  };

  const clearWishlist = () => {
    console.log('Clearing wishlist...');
    setWishlistItems([]);
    // Force immediate localStorage update
    localStorage.setItem('vaxdog-wishlist', JSON.stringify([]));
    toast.success('Wishlist cleared');
  };

  const isInWishlist = (productId: string) => {
    const stringId = String(productId);
    return wishlistItems.some(item => String(item.id) === stringId);
  };

  const isInCart = (productId: string) => {
    const stringId = String(productId);
    return cartItems.some(item => String(item.id) === stringId);
  };

  const getCartItemQuantity = (productId: string) => {
    const stringId = String(productId);
    const item = cartItems.find(item => String(item.id) === stringId);
    return item?.quantity || 0;
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Debug logging
  console.log('Current cart items:', cartItems);
  console.log('Current wishlist items:', wishlistItems);
  console.log('Cart count:', cartItemsCount);
  console.log('Wishlist count:', wishlistItems.length);
  console.log('Is initialized:', isInitialized);

  return {
    cartItems,
    wishlistItems,
    cartTotal,
    cartItemsCount,
    wishlistCount: wishlistItems.length,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    isInWishlist,
    isInCart,
    getCartItemQuantity
  };
};