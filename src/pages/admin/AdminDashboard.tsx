import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Users, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [productsRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const revenue = (ordersRes.data || []).reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        products: productsRes.count || 0,
        orders: (ordersRes.data || []).length,
        users: profilesRes.count || 0,
        revenue,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Products', value: stats.products, icon: Package, color: 'text-blue-500' },
    { title: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-green-500' },
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-purple-500' },
    { title: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-amber-500' },
  ];

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
