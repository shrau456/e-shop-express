import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  total: number;
  status: string;
  shipping_address: string | null;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null } | null;
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'bg-accent text-accent-foreground',
  processing: 'bg-primary/10 text-primary',
  shipped: 'bg-primary text-primary-foreground',
  delivered: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch profile names for each order
      const userIds = [...new Set(data.map(o => o.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.full_name]));
      const enriched = data.map(o => ({
        ...o,
        profiles: { full_name: profileMap.get(o.user_id) || null },
      }));
      setOrders(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) { toast.error('Failed to update status'); return; }
    toast.success(`Order status updated to ${status}`);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-foreground mb-6">Orders</h2>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{order.profiles?.full_name || 'Unknown'}</TableCell>
                  <TableCell className="font-medium">₹{Number(order.total).toLocaleString('en-IN')}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{order.shipping_address || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          <Badge className={statusColors[order.status] || ''}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
