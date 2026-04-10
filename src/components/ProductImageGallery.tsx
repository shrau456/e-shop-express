import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface Props {
  images: ProductImage[];
  productName: string;
  fallbackUrl?: string | null;
}

export default function ProductImageGallery({ images, productName, fallbackUrl }: Props) {
  const allImages = images.length > 0
    ? images.sort((a, b) => a.display_order - b.display_order)
    : fallbackUrl
      ? [{ id: 'fallback', image_url: fallbackUrl, display_order: 0 }]
      : [{ id: 'placeholder', image_url: '/placeholder.svg', display_order: 0 }];

  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border bg-card">
        <img
          src={allImages[selected].image_url}
          alt={`${productName} - image ${selected + 1}`}
          className="h-[400px] w-full object-cover transition-opacity duration-300"
        />
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={cn(
                'h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                i === selected ? 'border-primary ring-2 ring-primary/30' : 'border-muted hover:border-muted-foreground/50'
              )}
            >
              <img src={img.image_url} alt={`${productName} thumbnail ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
