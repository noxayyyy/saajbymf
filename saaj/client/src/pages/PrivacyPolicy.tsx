import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrivacyPolicy() {
  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  const content = settings?.page_privacy_policy;

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <h1 className="font-serif text-4xl tracking-wide mb-8">Privacy Policy</h1>
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
          <p>At SAAJ by MF, we are committed to protecting your personal information and your right to privacy.</p>
          <h2 className="font-serif text-xl mt-8 mb-4 text-foreground">Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, make a purchase, or contact us. This may include your name, email address, postal address, phone number, and payment information.</p>
          <h2 className="font-serif text-xl mt-8 mb-4 text-foreground">How We Use Your Information</h2>
          <p>We use the information we collect to process your orders, send you order confirmations and updates, respond to your comments and questions, and send you marketing communications (if you opt in).</p>
          <h2 className="font-serif text-xl mt-8 mb-4 text-foreground">Information Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to trusted third parties who assist us in operating our website, conducting our business, or serving you.</p>
          <h2 className="font-serif text-xl mt-8 mb-4 text-foreground">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at info@saajbymf.com</p>
        </div>
      )}
    </div>
  );
}
