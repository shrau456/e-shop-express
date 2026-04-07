import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  products: Database['public']['Tables']['products']['Row'];
};

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user.id);
    setItems((data as CartItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) return;
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity });
    }
    await fetchCart();
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(cartItemId);
    await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
    await fetchCart();
  };

  const removeFromCart = async (cartItemId: string) => {
    await supabase.from('cart_items').delete().eq('id', cartItemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * Number(i.products.price), 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
