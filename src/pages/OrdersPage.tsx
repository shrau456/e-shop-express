import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Package, Check, Truck, MapPin, Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, color: 'bg-accent text-accent-foreground' },
  confirmed: { label: 'Confirmed', icon: <Check className="h-4 w-4" />, color: 'bg-primary/10 text-primary' },
  shipped: { label: 'Shipped', icon: <Truck className="h-4 w-4" />, color: 'bg-primary/20 text-primary' },
  out_for_delivery: { label: 'Out for Delivery', icon: <MapPin className="h-4 w-4" />, color: 'bg-primary text-primary-foreground' },
  delivered: { label: 'Delivered', icon: <Check className="h-4 w-4" />, color: 'bg-green-500 text-white' },
  cancelled: { label: 'Cancelled', icon: <Clock className="h-4 w-4" />, color: 'bg-destructive text-destructive-foreground' },
};

function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return <Badge className="bg-destructive text-destructive-foreground">Cancelled</Badge>;
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const config = statusConfig[step];
        return (
          <div key={step} className="flex items-center">
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
              isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {config.icon}
              <span className="hidden sm:inline">{config.label}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 w-4 ${i < currentIndex ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground">Sign in to view your orders</h2>
          <Button className="mt-4" onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>

        {loading ? (
          <div className="mt-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : orders.length === 0 ? (
          <div className="mt-16 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No orders yet</p>
            <Button className="mt-4" onClick={() => navigate('/')}>Start Shopping</Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map(order => (
              <div key={order.id} className="rounded-lg border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="mt-1 font-semibold text-foreground">₹{Number(order.total).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className={statusConfig[order.status]?.color || 'bg-secondary text-secondary-foreground'}>
                    {statusConfig[order.status]?.label || order.status}
                  </Badge>
                </div>
                <OrderTimeline status={order.status} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
