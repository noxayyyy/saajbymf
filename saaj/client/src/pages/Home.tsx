import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import HeroSection from "@/components/HeroSection";
import CollectionGrid from "@/components/CollectionGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import BrandStory from "@/components/BrandStory";
import Seo from "@/components/Seo";
import type { Collection, Product } from "@shared/schema";

export default function Home() {
  const { data: collections, isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?featured=true"],
  });

  const { data: allProducts, isLoading: allProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const isProductsLoading = productsLoading || allProductsLoading;
  const displayProducts = products && products.length > 0 ? products : (allProducts || []).slice(0, 8);

  return (
    <div className="bg-white">
      <Seo
        title="SAAJ by MF | Modernity in Heritage — Luxury Pakistani Designer Wear"
        description="Discover SAAJ by MF — hand-embroidered luxury Pakistani designer wear. Shop new arrivals, bridal, formal, and ready-to-deliver collections."
        canonicalPath="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SAAJ by MF",
          url: "https://saajbymf.mtai.live/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://saajbymf.mtai.live/shop?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <HeroSection />

      {isProductsLoading ? (
        <div className="py-14 md:py-20 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="text-center mb-10">
            <Skeleton className="h-8 w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4]" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <FeaturedProducts
          products={displayProducts}
          title="NEW ARRIVALS"
        />
      )}

      <BrandStory />

      {collectionsLoading ? (
        <div className="py-14 md:py-20 px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        </div>
      ) : (
        <CollectionGrid collections={collections || []} />
      )}
    </div>
  );
}
