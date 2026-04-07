import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">Sign in to view your cart</h2>
          <Button className="mt-4" onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your cart is empty</p>
            <Button className="mt-4" onClick={() => navigate('/')}>Browse Products</Button>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                  <img src={item.products.image_url || '/placeholder.svg'} alt={item.products.name} className="h-20 w-20 rounded-md object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.products.name}</h3>
                    <p className="text-sm text-muted-foreground">${Number(item.products.price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="w-20 text-right font-semibold text-foreground">${(item.quantity * Number(item.products.price)).toFixed(2)}</p>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
            </div>

            <Button className="mt-6 w-full" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
