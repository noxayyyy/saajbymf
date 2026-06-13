import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Package, FolderOpen, ShoppingCart, Users, TrendingUp } from "lucide-react";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalCollections: number;
  totalRevenue: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats | null>({
    queryKey: ["/api/admin/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

  if (isLoading) {
    return <div className="animate-pulse space-y-6"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_,i)=><div key={i} className="h-32 bg-gray-200 rounded" />)}</div></div>;
  }

  const statCards = [
    { label: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "bg-amber-50 text-amber-600" },
    { label: "Total Customers", value: stats?.totalUsers || 0, icon: Users, color: "bg-green-50 text-green-600" },
    { label: "Collections", value: stats?.totalCollections || 0, icon: FolderOpen, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl tracking-wide">Dashboard</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-xs tracking-[0.1em] uppercase text-gray-500">{stat.label}</span>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="font-serif text-3xl">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-100 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="font-sans text-xs tracking-[0.1em] uppercase text-gray-500">Total Revenue</span>
        </div>
        <p className="font-serif text-4xl">{formatPrice(stats?.totalRevenue || 0)}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-gray-500">Recent Orders</h2>
        </div>
        {stats?.recentOrders && Array.isArray(stats.recentOrders) && stats.recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {stats.recentOrders.map((order: any) => (
              <div key={order.id} className="p-4 px-6 flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm">Order #{order.id.slice(0, 8)}</p>
                  <p className="font-sans text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-sm font-medium">{formatPrice(order.total)}</p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] tracking-wide uppercase rounded mt-1 ${
                    order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShoppingCart className="w-8 h-8 mx-auto text-gray-300 mb-3" />
            <p className="font-sans text-sm text-gray-400">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
