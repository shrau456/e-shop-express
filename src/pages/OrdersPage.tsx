import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Package } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

const statusColors: Record<string, string> = {
  pending: 'bg-accent text-accent-foreground',
  processing: 'bg-primary/10 text-primary',
  shipped: 'bg-primary text-primary-foreground',
  delivered: 'bg-success text-success-foreground',
};

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
              <div key={order.id} className="flex items-center justify-between rounded-lg border bg-card p-5">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                  <p className="mt-1 font-semibold text-foreground">${Number(order.total).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <Badge className={statusColors[order.status] || 'bg-secondary text-secondary-foreground'}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
