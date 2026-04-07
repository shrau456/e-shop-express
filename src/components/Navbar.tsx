import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
          ShopVault
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders"><Package className="mr-1 h-4 w-4" /> Orders</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="mr-1 h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth"><User className="mr-1 h-4 w-4" /> Sign In</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
