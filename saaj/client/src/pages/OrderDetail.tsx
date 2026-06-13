import { useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, Package, Truck, Home, X, ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Order, OrderItem } from "@shared/schema";

type OrderDetail = Order & { items: OrderItem[] };

const STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock, desc: "We've received your order." },
  { key: "confirmed", label: "Confirmed", icon: Check, desc: "Order confirmed and payment verified." },
  { key: "processing", label: "Processing", icon: Package, desc: "Your order is being packed." },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "On its way to you." },
  { key: "delivered", label: "Delivered", icon: Home, desc: "Order delivered successfully." },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function trackingStatus(order: OrderDetail): string {
  if (order.status === "cancelled") return "cancelled";
  if (
    order.status === "confirmed" &&
    (order.paymentStatus === "pending" || order.paymentStatus === "awaiting_verification")
  ) {
    return "pending";
  }
  return order.status;
}

function shortOrderNumber(id: string): string {
  if (!id) return "00000";
  const hex = id.replace(/[^0-9a-f]/gi, "").slice(-6) || "0";
  const num = parseInt(hex, 16);
  return String((num % 90000) + 10000);
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-PK", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatPrice(n: number, currency = "PKR") {
  return `${currency} ${Number(n || 0).toLocaleString()}`;
}

export default function OrderDetail() {
  const [, params] = useRoute("/order/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const orderId = params?.id || "";

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  function handleBack() {
    if (window.history.length > 2) {
      window.history.back();
    } else {
      navigate(user ? "/account" : "/track-order");
    }
  }

  const { data: order, isLoading, error } = useQuery<OrderDetail>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200" />
          <div className="h-40 w-full bg-gray-100" />
          <div className="h-60 w-full bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-24 text-center">
        <X className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h1 className="font-serif text-2xl mb-2" data-testid="text-order-not-found">Order not found</h1>
        <p className="font-sans text-sm text-gray-500 mb-6">
          We couldn't find this order. It may have been removed or you may not have access.
        </p>
        <Link href="/">
          <a className="inline-block px-8 py-3 bg-gray-900 text-white font-sans text-[12px] tracking-[0.3em] uppercase hover:bg-gray-800">
            Continue Shopping
          </a>
        </Link>
      </div>
    );
  }

  const status = trackingStatus(order);
  const isCancelled = status === "cancelled";
  const currentIdx = isCancelled
    ? -1
    : Math.max(0, STEPS.findIndex((s) => s.key === status));

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-10 md:py-16">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1 font-sans text-[12px] tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        data-testid="button-back"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <div>
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-gray-500">Order</p>
          <h1
            className="font-serif text-3xl md:text-4xl tracking-wide text-gray-900"
            data-testid="text-order-number"
          >
            #{shortOrderNumber(order.id)}
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1" data-testid="text-order-date">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1.5 font-sans text-[10px] tracking-[0.18em] uppercase ${
              isCancelled ? "bg-red-50 text-red-700"
                : status === "delivered" ? "bg-green-50 text-green-700"
                : status === "shipped" ? "bg-blue-50 text-blue-700"
                : status === "processing" ? "bg-amber-50 text-amber-700"
                : status === "confirmed" ? "bg-amber-50 text-amber-700"
                : "bg-gray-50 text-gray-700"
            }`}
            data-testid="badge-order-status"
          >
            {STATUS_LABELS[status] || status}
          </span>
          <span
            className={`px-3 py-1.5 font-sans text-[10px] tracking-[0.18em] uppercase ${
              order.paymentStatus === "paid" ? "bg-green-50 text-green-700"
                : order.paymentStatus === "awaiting_verification" ? "bg-amber-50 text-amber-700"
                : "bg-gray-50 text-gray-700"
            }`}
            data-testid="badge-payment-status"
          >
            {order.paymentStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Tracking timeline */}
      <div className="border border-gray-200 p-6 md:p-8 mb-8">
        <h2 className="font-serif text-xl tracking-wide text-gray-900 mb-6">Order Tracking</h2>

        {isCancelled ? (
          <div className="flex items-center gap-3 text-red-700 bg-red-50 border border-red-200 px-4 py-3 font-sans text-sm" data-testid="status-cancelled">
            <X className="w-5 h-5" />
            This order was cancelled. Contact us if you have any questions.
          </div>
        ) : (
          <>
            {/* Desktop horizontal */}
            <ol className="hidden md:flex items-start justify-between relative" data-testid="timeline-desktop">
              <div className="absolute top-5 left-[6%] right-[6%] h-[2px] bg-gray-200 -z-0" />
              <div
                className="absolute top-5 left-[6%] h-[2px] bg-[#c4972a] -z-0 transition-all"
                style={{ width: `${currentIdx <= 0 ? 0 : (currentIdx / (STEPS.length - 1)) * 88}%` }}
              />
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= currentIdx;
                const current = i === currentIdx;
                return (
                  <li key={step.key} className="relative z-10 flex flex-col items-center text-center w-1/5" data-testid={`step-${step.key}`}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        done ? "bg-[#c4972a] border-[#c4972a] text-white" : "bg-white border-gray-300 text-gray-400"
                      } ${current ? "ring-4 ring-[#c4972a]/20" : ""}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`mt-3 font-sans text-[11px] tracking-[0.12em] uppercase ${done ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    <p className="font-sans text-[11px] text-gray-500 mt-1 max-w-[140px]">{step.desc}</p>
                  </li>
                );
              })}
            </ol>

            {/* Mobile vertical */}
            <ol className="md:hidden space-y-5" data-testid="timeline-mobile">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= currentIdx;
                const current = i === currentIdx;
                return (
                  <li key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                          done ? "bg-[#c4972a] border-[#c4972a] text-white" : "bg-white border-gray-300 text-gray-400"
                        } ${current ? "ring-4 ring-[#c4972a]/20" : ""}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-[2px] flex-1 mt-1 ${done && i < currentIdx ? "bg-[#c4972a]" : "bg-gray-200"}`} style={{ minHeight: 20 }} />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className={`font-sans text-[12px] tracking-[0.12em] uppercase ${done ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                      <p className="font-sans text-[12px] text-gray-500 mt-1">{step.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      {/* Items + Summary */}
      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div className="border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-serif text-lg tracking-wide">Items</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-5" data-testid={`item-${item.id}`}>
                <img
                  src={item.productImage || ""}
                  alt={item.productName}
                  className="w-20 h-20 object-cover bg-gray-50"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-gray-900 truncate">{item.productName}</p>
                  <p className="font-sans text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="font-sans text-sm text-gray-900 whitespace-nowrap">
                  {formatPrice(item.price * item.quantity, order.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 p-5">
            <h3 className="font-serif text-lg tracking-wide mb-4">Summary</h3>
            <div className="flex justify-between font-sans text-sm py-1">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(order.total, order.currency)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm py-1">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-500">—</span>
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-sans text-base">
              <span className="font-medium">Total</span>
              <span className="font-medium" data-testid="text-order-total">{formatPrice(order.total, order.currency)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 font-sans text-xs text-gray-600 space-y-1">
              <div><span className="text-gray-400">Payment:</span> {order.paymentMethod}</div>
              <div><span className="text-gray-400">Status:</span> {order.paymentStatus.replace(/_/g, " ")}</div>
            </div>
          </div>

          <div className="border border-gray-200 p-5">
            <h3 className="font-serif text-lg tracking-wide mb-3">Shipping Address</h3>
            <div className="font-sans text-sm text-gray-700 leading-relaxed" data-testid="text-shipping-address">
              {order.shippingFirstName} {order.shippingLastName}<br />
              {order.shippingAddress}<br />
              {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ""} {order.shippingZip || ""}<br />
              {order.shippingCountry}<br />
              <span className="text-gray-500">{order.shippingPhone}</span><br />
              <span className="text-gray-500">{order.shippingEmail}</span>
            </div>
          </div>

          {order.paymentScreenshot && (
            <div className="border border-gray-200 p-5">
              <h3 className="font-serif text-lg tracking-wide mb-3">Payment Receipt</h3>
              <a href={order.paymentScreenshot} target="_blank" rel="noreferrer">
                <img
                  src={order.paymentScreenshot}
                  alt="Payment receipt"
                  className="w-full border border-gray-100"
                  data-testid="img-payment-screenshot"
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
