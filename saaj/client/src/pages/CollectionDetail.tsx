import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import type { Collection, Product } from "@shared/schema";

const SIZES = ["S", "M", "L", "XL", "Custom Size"];

export default function CollectionDetail() {
  const [, params] = useRoute("/collections/:slug");
  const slug = params?.slug;
  const [sortBy, setSortBy] = useState("latest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  const { data: collection, isLoading: collectionLoading } = useQuery<Collection>({
    queryKey: ["/api/collections", slug],
    enabled: !!slug,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [`/api/products?collection=${slug}`],
    enabled: !!slug,
  });

  const { colorOptions, fabricOptions, minPrice, maxPrice } = useMemo(() => {
    const colors = new Set<string>();
    const fabrics = new Set<string>();
    let min = Infinity, max = 0;
    for (const p of products || []) {
      if (p.color) colors.add(p.color);
      if (p.fabric) {
        p.fabric.split(/[\/,]/).map((f) => f.trim()).filter(Boolean).forEach((f) => fabrics.add(f));
      }
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }
    if (min === Infinity) min = 0;
    return {
      colorOptions: [...colors].sort(),
      fabricOptions: [...fabrics].sort(),
      minPrice: Math.floor(min),
      maxPrice: Math.ceil(max),
    };
  }, [products]);

  const effectivePriceRange = priceRange ?? [minPrice, maxPrice];

  const filtered = (products || []).filter((p) => {
    if (selectedColors.length && (!p.color || !selectedColors.includes(p.color))) return false;
    if (selectedFabrics.length) {
      const pf = (p.fabric || "").split(/[\/,]/).map((f) => f.trim());
      if (!selectedFabrics.some((f) => pf.includes(f))) return false;
    }
    if (p.price < effectivePriceRange[0] || p.price > effectivePriceRange[1]) return false;
    return true;
  });

  const sortedProducts = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "name-az": return a.name.localeCompare(b.name);
      case "name-za": return b.name.localeCompare(a.name);
      default: return 0;
    }
  });

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const activeFilterCount =
    selectedSizes.length + selectedColors.length + selectedFabrics.length +
    (priceRange ? 1 : 0);

  const clearAll = () => {
    setSelectedSizes([]); setSelectedColors([]); setSelectedFabrics([]); setPriceRange(null);
  };

  if (!slug) return null;

  if (!collectionLoading && !collection) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 text-center">
        <h2 className="font-serif text-2xl text-gray-900">Collection not found</h2>
        <Link href="/collections">
          <span className="inline-block mt-6 font-sans text-xs tracking-[0.15em] uppercase text-gray-500 cursor-pointer hover:text-[#c4151c] transition-colors">
            Back to Collections
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {collection && (
        <Seo
          title={`${collection.name} — SAAJ by MF`}
          description={collection.description || `Shop the ${collection.name} collection by SAAJ by MF.`}
          image={collection.image || undefined}
          canonicalPath={`/collections/${collection.slug}`}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: collection.name,
            description: collection.description || "",
          }}
        />
      )}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-5 md:pt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="font-sans text-[11px] tracking-[0.18em] uppercase text-gray-500"
          data-testid="text-collection-breadcrumb"
        >
          <Link href="/">
            <span className="cursor-pointer hover:text-[#c4151c] transition-colors">Home</span>
          </Link>
          <span className="mx-2 text-gray-300">&gt;</span>
          <span className="text-gray-900">{collection?.name || "Collection"}</span>
        </motion.div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-5 md:py-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-t border-b border-gray-100 py-3 md:py-4 mb-8 md:mb-10">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 font-sans text-[11px] tracking-[0.2em] uppercase text-gray-700 hover:text-[#c4151c] transition-colors"
            data-testid="button-refine-search"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Refine Search
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#c4151c] text-white text-[10px] tracking-normal">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-3">
            <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-gray-500">Sort By</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] border-gray-300 text-[11px] tracking-[0.15em] uppercase rounded-none h-9" data-testid="select-sort">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Position</SelectItem>
                <SelectItem value="name-az">Name: A to Z</SelectItem>
                <SelectItem value="name-za">Name: Z to A</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4]" />
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-sans text-sm text-gray-500 tracking-wider uppercase">
              {activeFilterCount > 0 ? "No products match the selected filters." : "No products in this collection yet."}
            </p>
            {activeFilterCount > 0 ? (
              <button
                onClick={clearAll}
                className="inline-block mt-6 font-sans text-xs tracking-[0.15em] uppercase text-gray-700 hover:text-[#c4151c] transition-colors cursor-pointer border-b border-gray-300 pb-1"
                data-testid="button-clear-filters-empty"
              >
                Clear Filters
              </button>
            ) : (
              <Link href="/shop">
                <span className="inline-block mt-6 font-sans text-xs tracking-[0.15em] uppercase text-gray-700 hover:text-[#c4151c] transition-colors cursor-pointer border-b border-gray-300 pb-1">
                  Shop All
                </span>
              </Link>
            )}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14"
            data-testid="grid-products"
          >
            {sortedProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="left" className="w-[340px] sm:w-[380px] p-0 bg-white border-r border-gray-200 overflow-y-auto" data-testid="sheet-refine">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <SheetClose asChild>
                <button className="text-gray-700 hover:text-[#c4151c] transition-colors" data-testid="button-close-refine">
                  <X className="w-4 h-4" />
                </button>
              </SheetClose>
              <SheetTitle className="font-sans text-[13px] tracking-[0.22em] uppercase text-gray-900 font-medium">
                Refine Search
              </SheetTitle>
              <div className="w-4" />
            </div>
          </SheetHeader>

          <div className="px-6 py-6 space-y-8">
            <FilterSection title="Size">
              {SIZES.map((s) => (
                <FilterCheckbox
                  key={s}
                  id={`size-${s}`}
                  label={s.toUpperCase()}
                  checked={selectedSizes.includes(s)}
                  onChange={() => toggle(selectedSizes, s, setSelectedSizes)}
                />
              ))}
            </FilterSection>

            {colorOptions.length > 0 && (
              <FilterSection title="Color">
                {colorOptions.map((c) => (
                  <FilterCheckbox
                    key={c}
                    id={`color-${c}`}
                    label={c.toUpperCase()}
                    checked={selectedColors.includes(c)}
                    onChange={() => toggle(selectedColors, c, setSelectedColors)}
                  />
                ))}
              </FilterSection>
            )}

            {fabricOptions.length > 0 && (
              <FilterSection title="Fabric">
                {fabricOptions.map((f) => (
                  <FilterCheckbox
                    key={f}
                    id={`fabric-${f}`}
                    label={f.toUpperCase()}
                    checked={selectedFabrics.includes(f)}
                    onChange={() => toggle(selectedFabrics, f, setSelectedFabrics)}
                  />
                ))}
              </FilterSection>
            )}

            {maxPrice > minPrice && (
              <FilterSection title="Price Range">
                <div className="px-1 pt-2">
                  <div className="flex items-center justify-between text-[11px] tracking-[0.15em] uppercase text-gray-500 mb-3">
                    <span>Min: Rs {effectivePriceRange[0].toLocaleString()}</span>
                    <span>Max: Rs {effectivePriceRange[1].toLocaleString()}</span>
                  </div>
                  <Slider
                    min={minPrice}
                    max={maxPrice}
                    step={500}
                    value={effectivePriceRange}
                    onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
                    data-testid="slider-price"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-700 mt-3 font-medium">
                    <span>{effectivePriceRange[0].toLocaleString()}</span>
                    <span>{effectivePriceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </FilterSection>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 font-sans text-[11px] tracking-[0.2em] uppercase border border-gray-300 py-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
              data-testid="button-clear-filters"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="flex-1 font-sans text-[11px] tracking-[0.2em] uppercase bg-gray-900 text-white py-3 hover:bg-[#c4151c] transition-colors"
              data-testid="button-apply-filters"
            >
              View {sortedProducts.length}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-sans text-[12px] tracking-[0.22em] uppercase text-gray-900 font-medium mb-3 pb-2 border-b border-gray-200">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FilterCheckbox({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="rounded-none border-gray-400 data-[state=checked]:bg-[#c4151c] data-[state=checked]:border-[#c4151c]"
        data-testid={`checkbox-${id}`}
      />
      <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-gray-600 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  );
}
