import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlistIds: Set<string>;
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setWishlistIds(new Set()); return; }
    setLoading(true);
    supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setWishlistIds(new Set((data || []).map(d => d.product_id)));
        setLoading(false);
      });
  }, [user]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) { toast.error('Please sign in to use wishlist'); return; }

    if (wishlistIds.has(productId)) {
      setWishlistIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
      toast.success('Removed from wishlist');
    } else {
      setWishlistIds(prev => new Set(prev).add(productId));
      await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
      toast.success('Added to wishlist');
    }
  }, [user, wishlistIds]);

  const isInWishlist = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, loading, toggleWishlist, isInWishlist, totalItems: wishlistIds.size }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
