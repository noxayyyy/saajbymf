import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Eye, Trash2 } from "lucide-react";
import type { Order, OrderItem } from "@shared/schema";

export default function AdminOrders() {
  const { toast } = useToast();
  const [viewOrder, setViewOrder] = useState<(Order & { items?: OrderItem[] }) | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{ id: string; status: string; paymentStatus: string } | null>(null);

  const { data: ordersRaw, isLoading } = useQuery<Order[] | null>({
    queryKey: ["/api/admin/orders"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];

  const viewOrderQuery = useQuery<Order & { items: OrderItem[] } | null>({
    queryKey: ["/api/admin/orders", viewOrder?.id],
    enabled: !!viewOrder,
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/orders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setStatusUpdate(null);
      toast({ title: "Order updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Order deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Delete failed", description: err?.message, variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm(`Delete order #${id.slice(0, 8)}? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;
  const formatDate = (date: string | Date | null) => date ? new Date(date).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl tracking-wide">Orders</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">{orders.length} orders</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="font-sans text-sm text-gray-400">No orders yet</p>
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Order</th>
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Date</th>
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Payment</th>
                <th className="px-6 py-3 text-right font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Total</th>
                <th className="px-6 py-3 text-right font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-sans text-sm">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-sans text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[10px] tracking-wide uppercase rounded ${
                      order.status === "delivered" ? "bg-green-50 text-green-700" :
                      order.status === "shipped" ? "bg-blue-50 text-blue-700" :
                      order.status === "confirmed" ? "bg-amber-50 text-amber-700" :
                      order.status === "cancelled" ? "bg-red-50 text-red-700" :
                      "bg-gray-50 text-gray-700"
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[10px] tracking-wide uppercase rounded ${
                      order.paymentStatus === "paid" ? "bg-green-50 text-green-700" :
                      order.paymentStatus === "awaiting_verification" ? "bg-blue-50 text-blue-700" :
                      order.paymentStatus === "failed" ? "bg-red-50 text-red-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>{order.paymentStatus === "awaiting_verification" ? "Verifying" : order.paymentStatus}</span>
                  </td>
                  <td className="px-6 py-4 font-sans text-sm text-right font-medium">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewOrder(order)} data-testid={`button-view-order-${order.id}`}><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setStatusUpdate({ id: order.id, status: order.status, paymentStatus: order.paymentStatus })} data-testid={`button-update-order-${order.id}`}>Update</Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(order.id)} disabled={deleteMutation.isPending} className="text-red-600 hover:text-red-700 hover:bg-red-50" data-testid={`button-delete-order-${order.id}`}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader><DialogTitle className="font-serif text-xl">Order #{viewOrder?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {viewOrderQuery.data && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Status:</span> <span className="font-medium">{viewOrderQuery.data.status}</span></div>
                <div><span className="text-gray-500">Payment:</span> <span className="font-medium">{viewOrderQuery.data.paymentStatus}</span></div>
                <div><span className="text-gray-500">Method:</span> <span className="font-medium capitalize">{
                  viewOrderQuery.data.paymentMethod === "cod" ? "Cash on Delivery" :
                  viewOrderQuery.data.paymentMethod === "card" ? "Credit/Debit Card" :
                  viewOrderQuery.data.paymentMethod === "jazzcash" ? "JazzCash" :
                  viewOrderQuery.data.paymentMethod === "payoneer" ? "Payoneer" :
                  viewOrderQuery.data.paymentMethod
                }</span></div>
                <div><span className="text-gray-500">Total:</span> <span className="font-medium">{formatPrice(viewOrderQuery.data.total)}</span></div>
              </div>
              {viewOrderQuery.data.paymentScreenshot && (
                <div className="text-sm border-t pt-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Payment Screenshot</p>
                  <a
                    href={viewOrderQuery.data.paymentScreenshot}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="link-payment-screenshot"
                  >
                    <img
                      src={viewOrderQuery.data.paymentScreenshot}
                      alt="Customer payment screenshot"
                      className="max-h-72 w-auto border border-gray-200 rounded"
                      data-testid="img-payment-screenshot"
                    />
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Click image to open full size</p>
                </div>
              )}
              {viewOrderQuery.data.shippingAddress && (
                <div className="text-sm border-t pt-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Shipping</p>
                  <p>{viewOrderQuery.data.shippingFirstName} {viewOrderQuery.data.shippingLastName}</p>
                  <p className="text-gray-600">{viewOrderQuery.data.shippingAddress}</p>
                  <p className="text-gray-600">{viewOrderQuery.data.shippingCity}, {viewOrderQuery.data.shippingCountry}</p>
                  <p className="text-gray-600">{viewOrderQuery.data.shippingPhone}</p>
                </div>
              )}
              <div className="border-t pt-4">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Items</p>
                <div className="space-y-3">
                  {viewOrderQuery.data.items?.map((item: OrderItem) => (
                    <div key={item.id} className="flex gap-3">
                      {item.productImage && <img src={item.productImage} alt={item.productName} className="w-12 h-16 object-cover rounded" />}
                      <div>
                        <p className="font-sans text-sm">{item.productName}</p>
                        <p className="font-sans text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusUpdate} onOpenChange={() => setStatusUpdate(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader><DialogTitle>Update Order Status</DialogTitle></DialogHeader>
          {statusUpdate && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Order Status</Label>
                <Select value={statusUpdate.status} onValueChange={v => setStatusUpdate(s => s ? { ...s, status: v } : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Payment Status</Label>
                <Select value={statusUpdate.paymentStatus} onValueChange={v => setStatusUpdate(s => s ? { ...s, paymentStatus: v } : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="awaiting_verification">Awaiting Verification</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setStatusUpdate(null)}>Cancel</Button>
                <Button onClick={() => statusUpdate && updateMutation.mutate({ id: statusUpdate.id, data: { status: statusUpdate.status, paymentStatus: statusUpdate.paymentStatus } })} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
