import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  selected_specs: any[];
  custom_dimensions: any;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_description: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  const getOrCreateCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getSessionId();

    let cartQuery = supabase
      .from('cart')
      .select('id')
      .limit(1);

    if (user) {
      cartQuery = cartQuery.eq('user_id', user.id);
    } else {
      cartQuery = cartQuery.eq('session_id', sessionId);
    }

    const { data: existingCart } = await cartQuery.single();

    if (existingCart) {
      return existingCart.id;
    }

    const { data: newCart, error } = await supabase
      .from('cart')
      .insert({
        user_id: user?.id || null,
        session_id: !user ? sessionId : null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return newCart.id;
  };

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getSessionId();

      let cartQuery = supabase
        .from('cart')
        .select(`
          id,
          cart_items (
            id,
            product_id,
            quantity,
            selected_specs,
            custom_dimensions,
            unit_price,
            total_price,
            products (
              name,
              description
            )
          )
        `);

      if (user) {
        cartQuery = cartQuery.eq('user_id', user.id);
      } else {
        cartQuery = cartQuery.eq('session_id', sessionId);
      }

      const { data: cartData } = await cartQuery.single();

      if (cartData?.cart_items) {
        const cartItems = cartData.cart_items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          selected_specs: item.selected_specs || [],
          custom_dimensions: item.custom_dimensions,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price),
          product_name: item.products?.name || '',
          product_description: item.products?.description || '',
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    try {
      const cartId = await getOrCreateCart();

      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: item.product_id,
          quantity: item.quantity,
          selected_specs: item.selected_specs,
          custom_dimensions: item.custom_dimensions,
          unit_price: item.unit_price,
          total_price: item.total_price,
        });

      if (error) throw error;

      await loadCartItems();
      toast({
        title: "Added to cart",
        description: `${item.product_name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await loadCartItems();
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const newTotalPrice = item.unit_price * quantity;

      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity,
          total_price: newTotalPrice,
        })
        .eq('id', itemId);

      if (error) throw error;

      await loadCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getSessionId();

      let cartQuery = supabase.from('cart').select('id');

      if (user) {
        cartQuery = cartQuery.eq('user_id', user.id);
      } else {
        cartQuery = cartQuery.eq('session_id', sessionId);
      }

      const { data: cart } = await cartQuery.single();

      if (cart) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id);

        if (error) throw error;
      }

      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartTotal = items.reduce((total, item) => total + item.total_price, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    loadCartItems();
  }, []);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount,
    loading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};