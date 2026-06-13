import { useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";

function shortOrderNumber(id: string): string {
  if (!id) return "00000";
  const hex = id.replace(/[^0-9a-f]/gi, "").slice(-6) || "0";
  const num = parseInt(hex, 16);
  return String((num % 90000) + 10000);
}

export default function OrderSuccess() {
  const [, params] = useRoute("/order-success/:id");
  const [, navigate] = useLocation();
  const orderId = params?.id || "";
  const orderNumber = shortOrderNumber(orderId);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="bg-white min-h-[70vh] flex items-start justify-center px-4 py-16 md:py-24">
      <div className="max-w-2xl w-full text-center">
        <h1
          className="font-serif text-[34px] md:text-[42px] tracking-[0.04em] text-gray-900"
          data-testid="text-thank-you"
        >
          THANK YOU
        </h1>

        <p className="font-sans text-[14px] text-gray-700 mt-6">
          Your order has been successfully processed!
        </p>
        <p className="font-sans text-[14px] text-gray-700 mt-1">
          Our customer services representative will get in touch with you.
        </p>

        <p className="font-sans text-[16px] text-gray-900 font-semibold mt-8" data-testid="text-order-number">
          Order number: {orderNumber}
        </p>

        {orderId && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <Link href={`/track-order`}>
              <a
                className="inline-block px-8 py-3 border border-gray-900 text-gray-900 font-sans text-[12px] tracking-[0.25em] uppercase hover:bg-gray-900 hover:text-white transition-colors"
                data-testid="link-track-order"
              >
                Track My Order
              </a>
            </Link>
            <Link href={`/order/${orderId}`}>
              <a
                className="font-sans text-[12px] tracking-[0.18em] uppercase text-gray-500 hover:text-gray-900 underline underline-offset-4"
                data-testid="link-order-details"
              >
                View Order Details
              </a>
            </Link>
          </div>
        )}

        <div className="mt-10">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-16 py-4 bg-gray-900 text-white font-sans text-[13px] tracking-[0.4em] uppercase hover:bg-gray-800 transition-colors"
            data-testid="button-continue"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
