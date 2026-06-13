import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCurrency } from "@/lib/currency";

export default function Cart() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  const [, navigate] = useLocation();
  const { formatPrice } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-6" />
        <h1 className="font-serif text-2xl md:text-3xl mb-3">Your Bag is Empty</h1>
        <p className="font-sans text-sm text-muted-foreground mb-8">
          Discover our collections and find something you love
        </p>
        <Button
          onClick={() => navigate("/shop")}
          className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-xs tracking-[0.2em] uppercase h-12 px-10"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 md:py-20">
      <h1 className="font-serif text-3xl md:text-4xl tracking-wide mb-2">Shopping Bag</h1>
      <p className="font-sans text-sm text-muted-foreground mb-10">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-0 divide-y divide-border/50">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-5 py-6">
              <Link href={`/product/${item.product.slug}`}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 md:w-32 h-32 md:h-40 object-cover"
                />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/product/${item.product.slug}`}>
                        <h3 className="font-serif text-lg hover:text-primary transition-colors cursor-pointer">
                          {item.product.name}
                        </h3>
                      </Link>
                      {item.product.fabric && (
                        <p className="font-sans text-xs text-muted-foreground mt-1">{item.product.fabric}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div className="flex items-center border border-border/60">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-muted/50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-4 font-sans text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-serif text-lg">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-muted/30 p-6 sticky top-24">
            <h3 className="font-sans text-xs tracking-[0.2em] uppercase mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-sans text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between font-sans text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-border/50 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-sans text-sm font-medium">Total</span>
                <span className="font-serif text-xl">{formatPrice(total)}</span>
              </div>
            </div>
            <Button
              onClick={() => navigate("/checkout")}
              className="w-full h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-xs tracking-[0.2em] uppercase"
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/shop")}
              className="w-full mt-3 font-sans text-xs tracking-[0.15em] uppercase"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
