import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Shirt,
  Package,
  ZoomIn,
  ZoomOut,
  X,
  Maximize2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import SizeGuideDialog from "@/components/SizeGuideDialog";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/lib/currency";
import FeaturedProducts from "@/components/FeaturedProducts";
import Seo from "@/components/Seo";
import type { Product, Collection } from "@shared/schema";


const availableSizes = ["XS", "S", "M", "ML", "L", "XL"];
const CUSTOM_SIZE_FEE = 5500;
const ADDONS: { id: string; label: string; price: number }[] = [
  { id: "scarf", label: "Scandinavian Scarf", price: 5800 },
  { id: "pants", label: "Balloon Pants", price: 18000 },
  { id: "sleeves", label: "Embroidered Sleeves", price: 3200 },
];
const ZOOM_LEVELS = [1, 1.5, 2, 2.5];

function ImageLightbox({
  images,
  startIndex,
  productName,
  onClose,
}: {
  images: string[];
  startIndex: number;
  productName: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [currentIndex, zoom]);

  const goToPrev = () => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    resetZoom();
  };

  const goToNext = () => {
    setCurrentIndex((i) => (i + 1) % images.length);
    resetZoom();
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((z) => {
      const idx = ZOOM_LEVELS.indexOf(z);
      return idx < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[idx + 1] : z;
    });
  };

  const handleZoomOut = () => {
    setZoom((z) => {
      const idx = ZOOM_LEVELS.indexOf(z);
      if (idx > 0) return ZOOM_LEVELS[idx - 1];
      setPan({ x: 0, y: 0 });
      return ZOOM_LEVELS[0];
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && zoom > 1) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black flex flex-col"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/90 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm font-sans">
              {currentIndex + 1} / {images.length}
            </span>
            <span className="hidden sm:block text-white/40 text-sm">|</span>
            <span className="hidden sm:block text-white/50 text-sm font-sans truncate max-w-[200px]">
              {productName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-2 text-white/70 hover:text-white disabled:text-white/20 transition-colors"
              title="Zoom out (−)"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white/50 text-xs font-sans w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              className="p-2 text-white/70 hover:text-white disabled:text-white/20 transition-colors"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-5 bg-white/20 mx-2" />
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className="flex-1 flex items-center justify-center overflow-hidden relative select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
        >
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={images[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            className="max-h-[calc(100vh-120px)] max-w-[90vw] object-contain"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: dragging ? "none" : "transform 0.2s ease",
            }}
            draggable={false}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors rounded-full"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors rounded-full"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-3 bg-black/90 border-t border-white/10 overflow-x-auto px-4 shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  resetZoom();
                }}
                className={`w-12 h-16 sm:w-14 sm:h-[72px] shrink-0 overflow-hidden border-2 transition-all ${
                  currentIndex === idx
                    ? "border-white opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug;
  const { addItem } = useCart();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [quantity, setQuantity] = useState(1);
  const [deliveryOpen, setDeliveryOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [mainImgError, setMainImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", slug],
    enabled: !!slug,
  });

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const otherProducts = (relatedProducts || [])
    .filter((p) => p.slug !== slug)
    .slice(0, 4);

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("saaj_recently_viewed");
      if (stored) setRecentlyViewedIds(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (!product?.id) return;
    try {
      const stored = localStorage.getItem("saaj_recently_viewed");
      const prev: string[] = stored ? JSON.parse(stored) : [];
      const updated = [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 8);
      localStorage.setItem("saaj_recently_viewed", JSON.stringify(updated));
    } catch {}
  }, [product?.id]);

  const recentlyViewed = (relatedProducts || [])
    .filter((p) => recentlyViewedIds.includes(p.id) && p.slug !== slug)
    .sort((a, b) => recentlyViewedIds.indexOf(a.id) - recentlyViewedIds.indexOf(b.id))
    .slice(0, 4);

  const collection = product?.collectionId
    ? collections?.find((c) => c.id === product.collectionId)
    : null;

  const productImages = product
    ? Array.from(new Set([
        product.image,
        ...(product.gallery || []),
        product.hoverImage,
      ].filter(Boolean) as string[]))
    : [];

  useEffect(() => {
    if (productImages.length < 2 || lightboxOpen || autoPaused) return;
    const id = setInterval(() => {
      setMainImageIndex((i) => (i + 1) % productImages.length);
      setMainImgError(false);
    }, 3500);
    return () => clearInterval(id);
  }, [productImages.length, lightboxOpen, autoPaused]);

  const pauseAuto = useCallback(() => {
    setAutoPaused(true);
    const t = setTimeout(() => setAutoPaused(false), 10000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setMainImageIndex(0);
    setAutoPaused(false);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="flex gap-3">
            <div className="hidden md:flex flex-col gap-2 w-[80px]">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full" />
              ))}
            </div>
            <Skeleton className="flex-1 aspect-[3/4]" />
          </div>
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-32 w-full mt-4" />
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 text-center">
        <h2 className="font-serif text-2xl text-gray-900">Product not found</h2>
        <Link href="/shop">
          <span className="inline-block mt-6 px-8 py-3 border border-gray-300 text-xs tracking-[0.15em] uppercase text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            Back to Shop
          </span>
        </Link>
      </div>
    );
  }

  const skuCode = product.sku || `SAAJ-${(product.id || "").slice(-4).toUpperCase()}`;

  return (
    <div className="bg-white">
      <Seo
        title={`${product.name} — SAAJ by MF`}
        description={
          (product.description && product.description.replace(/<[^>]+>/g, "").slice(0, 160)) ||
          `${product.name} — ${product.fabric || "luxury Pakistani designer wear"} by SAAJ by MF.`
        }
        image={product.image}
        type="product"
        canonicalPath={`/product/${product.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: [product.image, ...(product.gallery || [])].filter(Boolean),
          description: (product.description || "").replace(/<[^>]+>/g, "").slice(0, 5000),
          sku: skuCode,
          brand: { "@type": "Brand", name: "SAAJ by MF" },
          offers: {
            "@type": "Offer",
            priceCurrency: product.currency || "PKR",
            price: product.price,
            availability: "https://schema.org/InStock",
            url: `https://saajbymf.mtai.live/product/${product.slug}`,
          },
        }}
      />
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-2 font-sans text-[11px] tracking-[0.06em] uppercase text-gray-500">
          <Link href="/">
            <span className="hover:text-gray-900 transition-colors cursor-pointer">Home</span>
          </Link>
          <span className="text-gray-300">&gt;</span>
          {collection && (
            <>
              <Link href={`/collections/${collection.slug}`}>
                <span className="hover:text-gray-900 transition-colors cursor-pointer">{collection.name}</span>
              </Link>
              <span className="text-gray-300">&gt;</span>
            </>
          )}
          <span className="text-gray-800">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-16 md:pb-24 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="flex gap-3">
            {productImages.length > 1 && (
              <div className="hidden md:flex flex-col gap-2 w-[80px] shrink-0 max-h-[600px] overflow-y-auto">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMainImageIndex(idx);
                      setMainImgError(false);
                      pauseAuto();
                    }}
                    className={`aspect-[3/4] overflow-hidden border-2 transition-colors shrink-0 ${
                      mainImageIndex === idx ? "border-gray-900" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex-1 group">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`relative overflow-hidden bg-gray-50 cursor-pointer ${
                  imageZoomed ? "aspect-auto" : "aspect-[3/4]"
                }`}
                onClick={() => setLightboxOpen(true)}
              >
                {!mainImgError ? (
                  <img
                    src={productImages[mainImageIndex] || product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      imageZoomed ? "scale-150" : ""
                    }`}
                    onError={() => setMainImgError(true)}
                    key={mainImageIndex}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 aspect-[3/4]">
                    <Package className="w-16 h-16 mb-3" />
                    <span className="text-xs tracking-wider uppercase">No Image Available</span>
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-4 left-4">
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-[#c4151c] text-white px-3 py-1.5">
                      New
                    </span>
                  </div>
                )}
              </motion.div>

              <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageZoomed(!imageZoomed);
                  }}
                  className="w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                  title={imageZoomed ? "Minimize" : "Maximize"}
                >
                  {imageZoomed ? (
                    <ZoomOut className="w-4 h-4 text-gray-700" />
                  ) : (
                    <ZoomIn className="w-4 h-4 text-gray-700" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                  title="Open fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-gray-700" />
                </button>
              </div>

              {productImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMainImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
                      setMainImgError(false);
                      pauseAuto();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors z-10"
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMainImageIndex((prev) => (prev + 1) % productImages.length);
                      setMainImgError(false);
                      pauseAuto();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors z-10"
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                    {productImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setMainImageIndex(idx);
                          setMainImgError(false);
                          pauseAuto();
                        }}
                        className={`h-[3px] transition-all ${
                          mainImageIndex === idx ? "w-6 bg-[#c4151c]" : "w-3 bg-white/70 hover:bg-white"
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                        data-testid={`dot-image-${idx}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex md:hidden gap-2 mt-2 overflow-x-auto pb-2">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMainImageIndex(idx);
                    setMainImgError(false);
                  }}
                  className={`w-16 h-20 shrink-0 overflow-hidden border-2 transition-colors ${
                    mainImageIndex === idx ? "border-gray-900" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="py-2 md:py-0"
          >
            <h1 className="font-serif text-2xl md:text-3xl tracking-wide text-gray-900 uppercase">
              {product.name}
            </h1>

            <p className="font-sans text-lg md:text-xl text-gray-800 mt-3">
              {formatPrice(product.price)}
            </p>

            <div className="mt-4 space-y-1.5 font-sans text-[13px] text-gray-700">
              <p><span className="font-semibold text-gray-900">SKU:</span> {skuCode}</p>
              <p><span className="font-semibold text-gray-900">Color:</span> {product.color || "Black"}</p>
              {product.fabric && (
                <p><span className="font-semibold text-gray-900">Fabric:</span> {product.fabric}</p>
              )}
              {product.pieces && (
                <p><span className="font-semibold text-gray-900">Pieces:</span> {product.pieces}</p>
              )}
              <p><span className="font-semibold text-gray-900">Work Details:</span> Embroidered And Embellished</p>
            </div>

            {product.description && (
              <div className="mt-6">
                <h3 className="font-sans text-[13px] font-bold tracking-[0.08em] uppercase text-gray-900 mb-3">
                  Product Details
                </h3>
                <p className="font-sans text-[13px] text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-sans text-[13px] font-bold tracking-[0.08em] uppercase text-gray-900 mb-3">
                Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    data-testid={`button-size-${size}`}
                    className={`min-w-[40px] h-[36px] px-3 border text-[12px] font-sans tracking-wider transition-colors ${
                      selectedSize === size
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedSize("Custom")}
                  data-testid="button-size-custom"
                  className={`h-[36px] px-3 border text-[12px] font-sans tracking-wider transition-colors ${
                    selectedSize === "Custom"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-600"
                  }`}
                >
                  Custom Size [+Rs {CUSTOM_SIZE_FEE.toLocaleString("en-PK")}]
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-sans text-[13px] font-bold tracking-[0.08em] uppercase text-gray-900 mb-3">
                You May Also Add
              </h3>
              <div className="space-y-2">
                {ADDONS.map((addon) => (
                  <label
                    key={addon.id}
                    className="flex items-center gap-3 font-sans text-[13px] text-gray-700 cursor-pointer hover:text-gray-900"
                    data-testid={`label-addon-${addon.id}`}
                  >
                    <Checkbox
                      checked={!!selectedAddons[addon.id]}
                      onCheckedChange={(v) =>
                        setSelectedAddons((s) => ({ ...s, [addon.id]: !!v }))
                      }
                      className="rounded-none border-gray-400 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                    />
                    <span>
                      {addon.label} <span className="text-gray-500">[+Rs {addon.price.toLocaleString("en-PK")}]</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                data-testid="button-open-size-guide"
                className="inline-flex items-center gap-2 font-sans text-[12px] tracking-[0.08em] uppercase text-gray-700 border border-gray-300 px-4 py-2.5 hover:border-gray-600 transition-colors cursor-pointer"
              >
                <Shirt className="w-4 h-4" />
                View the Size Guide
              </button>
            </div>

            <div className="mt-8">
              <h3 className="font-sans text-[13px] font-bold tracking-[0.08em] uppercase text-gray-900 mb-3">
                Quantity
              </h3>
              <div className="flex items-center gap-0">
                <div className="flex items-center border border-gray-300">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 h-10 text-center font-sans text-sm border-none outline-none bg-transparent"
                  />
                  <div className="flex flex-col border-l border-gray-300">
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="h-5 w-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b border-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-5 w-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addItem(product, quantity);
                    toast({ title: "Added to cart", description: `${product.name} (${selectedSize}) x${quantity} added to your cart` });
                  }}
                  className="flex-1 ml-3 h-10 bg-gray-900 text-white font-sans text-[12px] tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            <button className="flex items-center gap-2 mt-4 font-sans text-[13px] text-gray-600 hover:text-gray-900 transition-colors">
              <Heart className="w-4 h-4" />
              Add to wishlist
            </button>

            <div className="mt-8 border-t border-gray-200">
              <button
                onClick={() => setDeliveryOpen(!deliveryOpen)}
                className="flex items-center justify-between w-full py-4 font-sans text-[13px] font-bold tracking-[0.08em] uppercase text-gray-900"
              >
                Delivery Time
                <span className="text-gray-500 text-lg leading-none">{deliveryOpen ? "−" : "+"}</span>
              </button>
              {deliveryOpen && (
                <div className="pb-4 -mt-1">
                  <p className="font-sans text-[13px] text-gray-600 leading-relaxed">
                    The outfit will be delivered 4 to 6 weeks.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200">
              <button
                onClick={() => setCareOpen(!careOpen)}
                className="flex items-center justify-between w-full py-4 font-sans text-[13px] font-bold tracking-[0.08em] uppercase text-gray-900"
                data-testid="button-care-toggle"
              >
                Care Instructions
                <span className="text-gray-500 text-lg leading-none">{careOpen ? "−" : "+"}</span>
              </button>
              {careOpen && (
                <div className="pb-4 -mt-1">
                  <p className="font-sans text-[13px] text-gray-600 leading-relaxed">
                    Dry clean only. Store in a cool, dry place. Avoid direct sunlight and moisture. Handle embellishments with care to preserve the craftsmanship.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-b border-gray-200">
              <button
                onClick={() => setDisclaimerOpen(!disclaimerOpen)}
                className="flex items-center justify-between w-full py-4 font-sans text-[13px] font-bold tracking-[0.08em] uppercase text-gray-900"
                data-testid="button-disclaimer-toggle"
              >
                Disclaimer
                <span className="text-gray-500 text-lg leading-none">{disclaimerOpen ? "−" : "+"}</span>
              </button>
              {disclaimerOpen && (
                <div className="pb-4 -mt-1">
                  <p className="font-sans text-[13px] text-gray-600 leading-relaxed">
                    Product images are for reference. Slight variations in color and embellishment may occur due to the handcrafted nature of the garment and screen calibration. Final product may vary slightly from displayed image.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />

      {lightboxOpen && productImages.length > 0 && (
        <ImageLightbox
          images={productImages}
          startIndex={mainImageIndex}
          productName={product.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {recentlyViewed.length > 0 && (
        <FeaturedProducts products={recentlyViewed} title="Recently Viewed" />
      )}

      {recentlyViewed.length === 0 && otherProducts.length > 0 && (
        <FeaturedProducts products={otherProducts} title="You May Also Like" />
      )}
    </div>
  );
}
