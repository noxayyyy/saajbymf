import { Link } from "wouter";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, total, itemCount } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] p-0 flex flex-col bg-white border-l border-gray-200 [&>button]:hidden"
        data-testid="drawer-cart"
      >
        <div className="flex items-center justify-end px-5 pt-4 pb-2 shrink-0">
          <button
            onClick={closeCart}
            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Close cart"
            data-testid="button-close-cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-3 shrink-0">
          <p className="font-sans text-[13px] text-gray-700" data-testid="text-cart-summary">
            {itemCount === 0
              ? "Your cart is empty."
              : `There ${itemCount === 1 ? "is" : "are"} ${itemCount} item(s) in your cart.`}
          </p>
        </div>

        <div className="border-t border-gray-200 mx-6 shrink-0" />

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" strokeWidth={1.2} />
              <p className="font-sans text-[13px] text-gray-500 mb-6">
                Your shopping bag is empty.
              </p>
              <Link href="/shop">
                <span
                  onClick={closeCart}
                  className="inline-block px-8 py-3 bg-gray-900 text-white text-[11px] tracking-[0.18em] uppercase font-sans hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </span>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex gap-4 py-4 first:pt-0"
                  data-testid={`item-cart-${item.product.id}`}
                >
                  <Link href={`/product/${item.product.slug}`}>
                    <a onClick={closeCart} className="shrink-0 w-[78px] h-[100px] bg-gray-50 overflow-hidden block">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.slug}`}>
                      <a
                        onClick={closeCart}
                        className="font-serif text-[15px] text-gray-900 hover:text-[#c4151c] transition-colors block leading-tight"
                        data-testid={`text-cart-item-name-${item.product.id}`}
                      >
                        {item.product.name}
                      </a>
                    </Link>
                    {item.product.color && (
                      <p className="font-sans text-[11px] text-gray-500 mt-1">
                        Size: XS
                      </p>
                    )}
                    <p className="font-sans text-[13px] text-gray-800 mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          data-testid={`button-decrease-${item.product.id}`}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span
                          className="min-w-[28px] text-center font-sans text-[12px] text-gray-900"
                          data-testid={`text-quantity-${item.product.id}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          data-testid={`button-increase-${item.product.id}`}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                        data-testid={`button-remove-${item.product.id}`}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-5 shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[12px] tracking-[0.14em] uppercase text-gray-900 font-semibold">
                Sub-Total:
              </span>
              <span className="font-sans text-[15px] text-gray-900" data-testid="text-cart-subtotal">
                {formatPrice(total)}
              </span>
            </div>
            <p className="font-sans text-[12px] text-gray-500 -mt-2">
              Shipping is added at checkout
            </p>
            <Link href="/checkout">
              <a
                onClick={closeCart}
                className="block w-full text-center bg-gray-900 text-white font-sans text-[12px] tracking-[0.18em] uppercase py-3.5 hover:bg-gray-800 transition-colors"
                data-testid="button-go-to-cart"
              >
                Go to Cart
              </a>
            </Link>
            <Link href="/checkout">
              <a
                onClick={closeCart}
                className="block w-full text-center border border-gray-900 text-gray-900 font-sans text-[12px] tracking-[0.18em] uppercase py-3 hover:bg-gray-900 hover:text-white transition-colors"
                data-testid="button-checkout"
              >
                Checkout
              </a>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
