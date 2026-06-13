import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, Check, Package, Truck, Home, X,
  Search, RefreshCw, ChevronRight, Circle,
} from "lucide-react";
import type { Order, OrderItem } from "@shared/schema";

type OrderWithItems = Order & { items: OrderItem[] };

const STEPS = [
  { key: "pending",    label: "Order Placed",  icon: Clock,   desc: "We've received your order." },
  { key: "confirmed",  label: "Confirmed",     icon: Check,   desc: "Order confirmed & payment verified." },
  { key: "processing", label: "Processing",    icon: Package, desc: "Your order is being carefully packed." },
  { key: "shipped",    label: "Shipped",       icon: Truck,   desc: "Your parcel is on its way." },
  { key: "delivered",  label: "Delivered",     icon: Home,    desc: "Order delivered successfully." },
];

function shortOrderNumber(id: string): string {
  if (!id) return "00000";
  const hex = id.replace(/[^0-9a-f]/gi, "").slice(-6) || "0";
  const num = parseInt(hex, 16);
  return String((num % 90000) + 10000);
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-PK", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatPrice(n: number, currency = "PKR") {
  return `${currency} ${Number(n || 0).toLocaleString()}`;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function trackingStatus(order: OrderWithItems): string {
  if (order.status === "cancelled") return "cancelled";
  if (
    order.status === "confirmed" &&
    (order.paymentStatus === "pending" || order.paymentStatus === "awaiting_verification")
  ) {
    return "pending";
  }
  return order.status;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    delivered: "bg-green-50 text-green-700",
    shipped: "bg-blue-50 text-blue-700",
    processing: "bg-amber-50 text-amber-700",
    confirmed: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-700",
    pending: "bg-gray-50 text-gray-700",
  };
  return (
    <span className={`px-3 py-1.5 font-sans text-[10px] tracking-[0.18em] uppercase ${map[status] || "bg-gray-50 text-gray-700"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-green-50 text-green-700",
    awaiting_verification: "bg-amber-50 text-amber-700",
    pending: "bg-gray-50 text-gray-700",
    refunded: "bg-purple-50 text-purple-700",
    failed: "bg-red-50 text-red-700",
  };
  return (
    <span className={`px-3 py-1.5 font-sans text-[10px] tracking-[0.18em] uppercase ${map[status] || "bg-gray-50 text-gray-700"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function Timeline({ order }: { order: OrderWithItems }) {
  const status = trackingStatus(order);
  const isCancelled = status === "cancelled";
  const currentIdx = isCancelled
    ? -1
    : Math.max(0, STEPS.findIndex((s) => s.key === status));

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 text-red-700 bg-red-50 border border-red-200 px-4 py-3 font-sans text-sm" data-testid="status-cancelled">
        <X className="w-5 h-5 flex-shrink-0" />
        This order was cancelled. Contact us if you have any questions.
      </div>
    );
  }

  return (
    <>
      {/* Desktop horizontal */}
      <ol className="hidden md:flex items-start justify-between relative" data-testid="timeline-desktop">
        <div className="absolute top-5 left-[6%] right-[6%] h-[2px] bg-gray-200 -z-0" />
        <div
          className="absolute top-5 left-[6%] h-[2px] bg-[#c4972a] -z-0 transition-all duration-700"
          style={{ width: `${currentIdx <= 0 ? 0 : (currentIdx / (STEPS.length - 1)) * 88}%` }}
        />
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = i <= currentIdx;
          const current = i === currentIdx;
          return (
            <li key={step.key} className="relative z-10 flex flex-col items-center text-center w-1/5" data-testid={`step-${step.key}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? "bg-[#c4972a] border-[#c4972a] text-white" : "bg-white border-gray-300 text-gray-400"
              } ${current ? "ring-4 ring-[#c4972a]/20" : ""}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className={`mt-3 font-sans text-[11px] tracking-[0.12em] uppercase ${done ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                {step.label}
              </p>
              <p className="font-sans text-[11px] text-gray-500 mt-1 max-w-[130px] leading-relaxed">{step.desc}</p>
            </li>
          );
        })}
      </ol>

      {/* Mobile vertical */}
      <ol className="md:hidden space-y-4" data-testid="timeline-mobile">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = i <= currentIdx;
          const current = i === currentIdx;
          return (
            <li key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  done ? "bg-[#c4972a] border-[#c4972a] text-white" : "bg-white border-gray-300 text-gray-400"
                } ${current ? "ring-4 ring-[#c4972a]/20" : ""}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-[2px] flex-1 mt-1 min-h-[20px] ${done && i < currentIdx ? "bg-[#c4972a]" : "bg-gray-200"}`} />
                )}
              </div>
              <div className="pb-2 pt-1">
                <p className={`font-sans text-[12px] tracking-[0.12em] uppercase ${done ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <p className="font-sans text-[12px] text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function OrderResult({
  email,
  number,
  onReset,
}: {
  email: string;
  number: string;
  onReset: () => void;
}) {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const { data: order, isLoading, error, dataUpdatedAt } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders/track", email, number],
    queryFn: async () => {
      const res = await fetch(`/api/orders/track?email=${encodeURIComponent(email)}&number=${encodeURIComponent(number)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Order not found");
      }
      return res.json();
    },
    refetchInterval: 10000,
    staleTime: 0,
  });

  useEffect(() => {
    if (dataUpdatedAt) setLastRefreshed(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 mt-10">
        <div className="h-8 w-48 bg-gray-200 mx-auto" />
        <div className="h-28 w-full bg-gray-100" />
        <div className="h-52 w-full bg-gray-100" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mt-10 text-center border border-gray-200 py-14 px-6" data-testid="error-not-found">
        <X className="w-10 h-10 mx-auto text-gray-300 mb-4" />
        <h2 className="font-serif text-xl text-gray-800 mb-2">Order not found</h2>
        <p className="font-sans text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          We couldn't find an order matching that number and email. Please double-check your details.
        </p>
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gray-900 text-white font-sans text-[12px] tracking-[0.25em] uppercase hover:bg-gray-800 transition-colors"
          data-testid="button-try-again"
        >
          Try Again
        </button>
      </div>
    );
  }

  const orderNumber = shortOrderNumber(order.id);

  return (
    <div className="mt-10" data-testid="order-result">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-gray-500">Order</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-wide text-gray-900" data-testid="text-order-number">
            #{orderNumber}
          </h2>
          <p className="font-sans text-sm text-gray-500 mt-1" data-testid="text-order-date">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <StatusBadge status={trackingStatus(order)} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Live indicator + last refreshed */}
      <div className="flex items-center gap-2 mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="font-sans text-[11px] text-gray-400 tracking-wide">
          Live — auto-refreshes every 10 s · Last updated {lastRefreshed.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      {/* Timeline */}
      <div className="border border-gray-200 p-5 md:p-8 mb-6">
        <h3 className="font-serif text-lg tracking-wide text-gray-900 mb-6">Shipment Status</h3>
        <Timeline order={order} />
      </div>

      {/* Items + summary */}
      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        {/* Items */}
        <div className="border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-serif text-lg tracking-wide">Items ({order.items.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-5" data-testid={`item-${item.id}`}>
                <img
                  src={item.productImage || ""}
                  alt={item.productName}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover bg-gray-50 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-gray-900">{item.productName}</p>
                  <p className="font-sans text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="font-sans text-sm text-gray-900 whitespace-nowrap">
                  {formatPrice(item.price * item.quantity, order.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="border border-gray-200 p-5">
            <h3 className="font-serif text-lg tracking-wide mb-4">Order Summary</h3>
            <div className="space-y-2 font-sans text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(order.total, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-500">—</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-medium text-base">
                <span>Total</span>
                <span data-testid="text-total">{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 font-sans text-xs text-gray-600 space-y-1">
              <div><span className="text-gray-400">Payment:</span> {order.paymentMethod?.toUpperCase()}</div>
              <div><span className="text-gray-400">Status:</span> {order.paymentStatus.replace(/_/g, " ")}</div>
            </div>
          </div>

          <div className="border border-gray-200 p-5">
            <h3 className="font-serif text-lg tracking-wide mb-3">Delivery Address</h3>
            <div className="font-sans text-sm text-gray-700 leading-relaxed" data-testid="text-shipping-address">
              {order.shippingFirstName} {order.shippingLastName}<br />
              {order.shippingAddress}<br />
              {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ""}{order.shippingZip ? ` ${order.shippingZip}` : ""}<br />
              {order.shippingCountry}<br />
              <span className="text-gray-500">{order.shippingPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset link */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={onReset}
          className="font-sans text-[12px] tracking-[0.18em] uppercase text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors"
          data-testid="button-track-another"
        >
          Track Another Order
        </button>
        <Link href="/shop">
          <span className="inline-flex items-center gap-1 font-sans text-[12px] tracking-[0.18em] uppercase text-[#c4972a] hover:text-[#a67e22] cursor-pointer">
            Shop Now <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [submitted, setSubmitted] = useState<{ email: string; number: string } | null>(null);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimEmail = email.trim().toLowerCase();
    const trimNumber = number.trim().replace(/^#/, "");
    if (!trimEmail || !trimNumber) return;
    setSubmitted({ email: trimEmail, number: trimNumber });
  }

  return (
    <div className="max-w-[860px] mx-auto px-4 md:px-8 py-12 md:py-20">
      {/* Page heading */}
      <div className="text-center mb-10">
        <p className="font-sans text-[11px] tracking-[0.3em] uppercase text-gray-400 mb-2">SAAJ by MF</p>
        <h1 className="font-serif text-3xl md:text-4xl tracking-wide text-gray-900" data-testid="text-page-title">
          Track Your Order
        </h1>
        <p className="font-sans text-sm text-gray-500 mt-3 max-w-sm mx-auto">
          Enter your order number and email address to see real-time delivery updates.
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        className="border border-gray-200 p-6 md:p-8"
        data-testid="form-track"
      >
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-sans text-[11px] tracking-[0.2em] uppercase text-gray-600 mb-2">
              Order Number
            </label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="e.g. 47832"
              required
              className="w-full border border-gray-300 px-4 py-3 font-sans text-sm focus:outline-none focus:border-gray-900 placeholder-gray-400"
              data-testid="input-order-number"
            />
            <p className="font-sans text-[11px] text-gray-400 mt-1.5">
              Found in your confirmation email
            </p>
          </div>
          <div>
            <label className="block font-sans text-[11px] tracking-[0.2em] uppercase text-gray-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full border border-gray-300 px-4 py-3 font-sans text-sm focus:outline-none focus:border-gray-900 placeholder-gray-400"
              data-testid="input-email"
            />
            <p className="font-sans text-[11px] text-gray-400 mt-1.5">
              Email used at checkout
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-10 py-3.5 bg-gray-900 text-white font-sans text-[12px] tracking-[0.3em] uppercase hover:bg-gray-800 transition-colors flex items-center gap-2"
          data-testid="button-track-submit"
        >
          <Search className="w-4 h-4" />
          Track Order
        </button>
      </form>

      {/* Result */}
      {submitted && (
        <OrderResult
          key={`${submitted.email}::${submitted.number}`}
          email={submitted.email}
          number={submitted.number}
          onReset={() => setSubmitted(null)}
        />
      )}

      {/* Help text */}
      {!submitted && (
        <div className="mt-8 text-center">
          <p className="font-sans text-xs text-gray-400">
            Can't find your order?{" "}
            <Link href="/contact">
              <span className="text-gray-600 hover:text-gray-900 underline underline-offset-4 cursor-pointer">
                Contact us
              </span>
            </Link>
            {" "}or WhatsApp us at{" "}
            <a href="https://wa.me/923001775557" className="text-gray-600 hover:text-gray-900 underline underline-offset-4">
              +92-300-1775557
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
