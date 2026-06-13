import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import type { Product } from "@shared/schema";

const FILTER_LABELS: Record<string, string> = {
  ready: "Ready to Deliver",
  new: "New Arrivals",
  featured: "Most Loved",
};

export default function Shop() {
  const [sortBy, setSortBy] = useState("latest");
  const search = useSearch();
  const params = new URLSearchParams(search);
  const filter = params.get("filter") || "";

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filtered = (products || []).filter((p) => {
    if (filter === "ready") return p.isNew;
    if (filter === "new") return p.isFeatured;
    if (filter === "featured") return p.isFeatured;
    return true;
  });

  const sortedProducts = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name-az":
        return a.name.localeCompare(b.name);
      case "name-za":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const pageTitle = filter ? FILTER_LABELS[filter] || "Shop All" : "Shop All";
  const seoTitle = `${pageTitle} — SAAJ by MF`;

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={seoTitle}
        description="Shop the full SAAJ by MF collection — luxury hand-embroidered Pakistani designer wear, formals, bridal, and ready-to-deliver pieces."
        canonicalPath="/shop"
      />
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {filter && (
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide text-gray-900 mb-6">{pageTitle}</h1>
        )}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <p className="font-sans text-xs text-gray-500 tracking-[0.1em]">
            {sortedProducts.length} Products
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px] border-gray-300 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Date: Latest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name-az">Name: A-Z</SelectItem>
              <SelectItem value="name-za">Name: Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4]" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
