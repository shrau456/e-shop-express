import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

export default function ProductCard({ product }: { product: Product }) {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', product.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAvgRating(data.reduce((sum, r) => sum + r.rating, 0) / data.length);
          setReviewCount(data.length);
        }
      });
  }, [product.id]);

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="product-card-hover overflow-hidden border bg-card">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2 text-xs">{product.category}</Badge>
          <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          {avgRating !== null && (
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
          )}
          <p className="mt-2 text-lg font-bold text-primary">₹{Number(product.price).toLocaleString('en-IN')}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
