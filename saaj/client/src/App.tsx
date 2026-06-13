import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ConnectionStatus from "@/components/ConnectionStatus";
import PushOptIn from "@/components/PushOptIn";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Collections from "@/pages/Collections";
import CollectionDetail from "@/pages/CollectionDetail";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import Cart from "@/pages/Cart";
import OrderSuccess from "@/pages/OrderSuccess";
import OrderDetail from "@/pages/OrderDetail";
import Checkout from "@/pages/Checkout";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ShippingReturns from "@/pages/ShippingReturns";
import SizeGuide from "@/pages/SizeGuide";
import Contact from "@/pages/Contact";
import TrackOrder from "@/pages/TrackOrder";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCollections from "@/pages/admin/AdminCollections";
import AdminBanners from "@/pages/admin/AdminBanners";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminSettings from "@/pages/admin/AdminSettings";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

/** Convert hex (#c4151c or c4151c) to HSL space-separated (358 81% 43%) for CSS vars */
function hexToHsl(hex: string): string | null {
  hex = hex.replace(/^#/, "").trim();
  if (hex.length === 3)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null;
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  return `${h} ${s}% ${lPct}%`;
}

function FaviconUpdater() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  useEffect(() => {
    if (settings?.site_favicon) {
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (link) {
        link.href = settings.site_favicon;
      }
    }
  }, [settings?.site_favicon]);

  return null;
}

function ThemeColorUpdater() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  useEffect(() => {
    const hex = settings?.site_theme_color?.trim();
    const root = document.documentElement;
    if (hex && hexToHsl(hex)) {
      const hsl = hexToHsl(hex)!;
      const foregroundOnPrimary = "0 0% 98%"; /* white text on theme background */
      root.style.setProperty("--primary", hsl);
      root.style.setProperty("--primary-foreground", foregroundOnPrimary);
      root.style.setProperty("--ring", hsl);
      root.style.setProperty("--sidebar", hsl);
      root.style.setProperty("--sidebar-foreground", foregroundOnPrimary);
      root.style.setProperty("--sidebar-primary", hsl);
      root.style.setProperty("--sidebar-primary-foreground", foregroundOnPrimary);
      root.style.setProperty("--sidebar-ring", hsl);
      root.style.setProperty("--chart-1", hsl);
      root.style.setProperty("--chart-2", hsl.replace(/\d+%$/, "55%"));
      root.style.setProperty("--chart-3", hsl.replace(/\d+%$/, "45%"));
      root.style.setProperty("--chart-4", hsl.replace(/\d+%$/, "38%"));
      root.style.setProperty("--chart-5", hsl.replace(/\d+%$/, "32%"));
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--sidebar");
      root.style.removeProperty("--sidebar-foreground");
      root.style.removeProperty("--sidebar-primary");
      root.style.removeProperty("--sidebar-primary-foreground");
      root.style.removeProperty("--sidebar-ring");
      root.style.removeProperty("--chart-1");
      root.style.removeProperty("--chart-2");
      root.style.removeProperty("--chart-3");
      root.style.removeProperty("--chart-4");
      root.style.removeProperty("--chart-5");
    }
  }, [settings?.site_theme_color]);

  return null;
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/collections" component={AdminCollections} />
        <Route path="/admin/banners" component={AdminBanners} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/settings" component={AdminSettings} />
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return <AdminRoutes />;
  }

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/collections" component={Collections} />
          <Route path="/collections/:slug" component={CollectionDetail} />
          <Route path="/product/:slug" component={ProductDetail} />
          <Route path="/about" component={About} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/account" component={Account} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/order-success/:id" component={OrderSuccess} />
          <Route path="/order/:id" component={OrderDetail} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/shipping-returns" component={ShippingReturns} />
          <Route path="/size-guide" component={SizeGuide} />
          <Route path="/contact" component={Contact} />
          <Route path="/track-order" component={TrackOrder} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <CurrencyProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background">
                <ConnectionStatus />
                <FaviconUpdater />
                <ThemeColorUpdater />
                <PushOptIn />
                <Router />
              </div>
              <Toaster />
            </TooltipProvider>
          </CurrencyProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
