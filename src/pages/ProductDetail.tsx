import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!product) return;
    await addToCart(product.id, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground">Product not found</h2>
        <Button className="mt-4" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border bg-card">
            <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            <Badge variant="secondary" className="mb-3 w-fit">{product.category}</Badge>
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">{product.description}</p>

            <p className="mt-6 text-3xl font-bold text-primary">${Number(product.price).toFixed(2)}</p>

            <div className="mt-2">
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-success border-success">{product.stock} in stock</Badge>
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border px-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
