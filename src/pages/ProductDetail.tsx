import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ProductImageGallery from '@/components/ProductImageGallery';
import ReviewSection from '@/components/ReviewSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const [productRes, imagesRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('product_images').select('*').eq('product_id', id).order('display_order'),
      ]);
      setProduct(productRes.data);
      setImages((imagesRes.data as ProductImage[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!product) return;
    if (product.stock === 0) { toast.error('This product is out of stock'); return; }
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
          <ProductImageGallery images={images} productName={product.name} fallbackUrl={product.image_url} />

          <div className="flex flex-col justify-center">
            <Badge variant="secondary" className="mb-3 w-fit">{product.category}</Badge>
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">{product.description}</p>

            <p className="mt-6 text-3xl font-bold text-primary">₹{Number(product.price).toLocaleString('en-IN')}</p>

            <div className="mt-2">
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-600">{product.stock} in stock</Badge>
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

        <ReviewSection productId={product.id} />
      </main>
    </div>
  );
}
