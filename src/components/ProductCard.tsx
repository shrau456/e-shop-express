import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`}>
      <Card className="product-card-hover overflow-hidden border bg-card">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2 text-xs">{product.category}</Badge>
          <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          <p className="mt-3 text-lg font-bold text-primary">₹{Number(product.price).toLocaleString('en-IN')}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
