import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShippingReturns() {
  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  const content = settings?.page_shipping_returns;

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <h1 className="font-serif text-4xl tracking-wide mb-8">Shipping & Returns</h1>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      ) : content ? (
        <div
          className="font-sans text-sm leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="font-sans text-sm leading-relaxed text-muted-foreground space-y-6">
          <h2 className="font-serif text-xl mt-2 mb-4 text-foreground">Shipping Policy</h2>
          <p>We process and ship orders within 3-5 business days. Delivery times may vary depending on your location.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Within Pakistan: 3-7 business days</li>
            <li>International: 10-21 business days</li>
            <li>Free shipping on orders above PKR 25,000</li>
          </ul>
          <h2 className="font-serif text-xl mt-8 mb-4 text-foreground">Returns Policy</h2>
          <p>We want you to be completely satisfied with your purchase. If for any reason you are not satisfied, you may return the item within 7 days of receipt.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Items must be unworn, unwashed, and in original condition with all tags attached</li>
            <li>Sale items are final sale and cannot be returned or exchanged</li>
            <li>Custom or made-to-order items cannot be returned</li>
          </ul>
          <h2 className="font-serif text-xl mt-8 mb-4 text-foreground">How to Return</h2>
          <p>To initiate a return, please contact us at info@saajbymf.com with your order number and reason for return. We will provide you with return instructions.</p>
        </div>
      )}
    </div>
  );
}
