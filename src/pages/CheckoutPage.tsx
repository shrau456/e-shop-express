import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Banknote, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);

  if (!user) { navigate('/auth'); return null; }
  if (items.length === 0) { navigate('/cart'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { toast.error('Please enter a shipping address'); return; }

    setSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ user_id: user.id, total: totalPrice, shipping_address: address, status: 'pending' })
        .select()
        .single();

      if (orderError || !order) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: Number(item.products.price),
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      await clearCart();
      toast.success(paymentMethod === 'cod'
        ? 'Order placed! Pay with cash on delivery.'
        : 'Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-xl px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>

        <div className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="font-semibold text-foreground">Order Summary</h2>
          <div className="mt-3 space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.products.name} × {item.quantity}</span>
                <span className="text-foreground">₹{(item.quantity * Number(item.products.price)).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t pt-4">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <Label htmlFor="address">Shipping Address</Label>
            <Textarea id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your full shipping address" className="mt-1" />
          </div>

          <div>
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2 space-y-3">
              <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors opacity-50">
                <RadioGroupItem value="online" id="online" disabled />
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Online Payment</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Placing Order...' : `Place Order — ₹${totalPrice.toLocaleString('en-IN')}`}
          </Button>
        </form>
      </main>
    </div>
  );
}
