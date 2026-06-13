import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Package, User, LogOut, ChevronRight } from "lucide-react";
import type { Order } from "@shared/schema";

export default function Account() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
  });

  const updateProfile = useMutation({
    mutationFn: async (data: typeof profile) => {
      const res = await apiRequest("PUT", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile updated" });
    },
  });

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse font-sans text-muted-foreground">Loading...</div></div>;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const formatPrice = (price: number) =>
    `PKR ${price.toLocaleString()}`;

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-PK", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-wide">
            My Account
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Welcome, {user.firstName}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="font-sans text-xs tracking-[0.15em] uppercase gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <div className="flex gap-2 mb-10 border-b border-border/50">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-3 font-sans text-xs tracking-[0.15em] uppercase border-b-2 transition-colors ${
            activeTab === "orders" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
          }`}
        >
          <Package className="w-4 h-4" />
          Orders
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-3 font-sans text-xs tracking-[0.15em] uppercase border-b-2 transition-colors ${
            activeTab === "profile" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
      </div>

      {activeTab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-serif text-xl mb-2">No orders yet</h3>
              <p className="font-sans text-sm text-muted-foreground mb-6">
                Your order history will appear here
              </p>
              <Button
                onClick={() => navigate("/shop")}
                className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-xs tracking-[0.2em] uppercase"
              >
                Shop Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/order/${order.id}`}>
                  <a
                    className="block border border-border/50 p-6 hover:border-foreground/40 transition-colors"
                    data-testid={`link-order-${order.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-xs text-muted-foreground tracking-wide uppercase">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="font-serif text-lg mt-1">{formatPrice(order.total)}</p>
                        <p className="font-sans text-xs text-muted-foreground mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 font-sans text-[10px] tracking-[0.15em] uppercase ${
                          order.status === "delivered" ? "bg-green-50 text-green-700" :
                          order.status === "shipped" ? "bg-blue-50 text-blue-700" :
                          order.status === "confirmed" ? "bg-amber-50 text-amber-700" :
                          "bg-gray-50 text-gray-700"
                        }`}>
                          {order.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "profile" && (
        <form
          onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(profile); }}
          className="max-w-[500px] space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-sans text-xs tracking-[0.15em] uppercase">First Name</Label>
              <Input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} className="h-12 rounded-none border-border/60 font-sans text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-xs tracking-[0.15em] uppercase">Last Name</Label>
              <Input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} className="h-12 rounded-none border-border/60 font-sans text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-xs tracking-[0.15em] uppercase">Email</Label>
            <Input value={user.email} disabled className="h-12 rounded-none border-border/60 font-sans text-sm bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-xs tracking-[0.15em] uppercase">Phone</Label>
            <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="h-12 rounded-none border-border/60 font-sans text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-xs tracking-[0.15em] uppercase">Address</Label>
            <Input value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} className="h-12 rounded-none border-border/60 font-sans text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-sans text-xs tracking-[0.15em] uppercase">City</Label>
              <Input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} className="h-12 rounded-none border-border/60 font-sans text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-xs tracking-[0.15em] uppercase">Country</Label>
              <Input value={profile.country} onChange={e => setProfile(p => ({ ...p, country: e.target.value }))} className="h-12 rounded-none border-border/60 font-sans text-sm" />
            </div>
          </div>
          <Button
            type="submit"
            disabled={updateProfile.isPending}
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-xs tracking-[0.2em] uppercase h-12 px-8"
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      )}
    </div>
  );
}
