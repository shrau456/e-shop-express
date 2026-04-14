import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const P = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<P><Index /></P>} />
                <Route path="/product/:id" element={<P><ProductDetail /></P>} />
                <Route path="/cart" element={<P><CartPage /></P>} />
                <Route path="/checkout" element={<P><CheckoutPage /></P>} />
                <Route path="/orders" element={<P><OrdersPage /></P>} />
                <Route path="/profile" element={<P><ProfilePage /></P>} />
                <Route path="/wishlist" element={<P><WishlistPage /></P>} />
                <Route path="/admin" element={<P><AdminDashboard /></P>} />
                <Route path="/admin/products" element={<P><AdminProducts /></P>} />
                <Route path="/admin/orders" element={<P><AdminOrders /></P>} />
                <Route path="/admin/users" element={<P><AdminUsers /></P>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
