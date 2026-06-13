import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@shared/schema";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
}

const STEP_INTERVAL_MS = 5000;
const STEP_TRANSITION_MS = 1400;

export default function FeaturedProducts({
  products,
  title = "NEW ARRIVALS",
}: FeaturedProductsProps) {
  if (!products.length) return null;

  const display = products.slice(0, 12);
  const loop = [...display, ...display];

  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [stepPx, setStepPx] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const item = itemRef.current;
      if (!track || !item) return;
      const items = track.children;
      if (items.length < 2) {
        setStepPx(item.getBoundingClientRect().width);
        return;
      }
      const a = (items[0] as HTMLElement).getBoundingClientRect().left;
      const b = (items[1] as HTMLElement).getBoundingClientRect().left;
      setStepPx(b - a);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [display.length]);

  const next = useCallback(() => {
    setAnimate(true);
    setIndex((i) => i + 1);
  }, []);

  const prev = useCallback(() => {
    setAnimate(true);
    setIndex((i) => {
      if (i <= 0) {
        // Jump invisibly to the duplicated set, then step back so the
        // user-visible motion is a smooth one-card slide to the left.
        window.requestAnimationFrame(() => {
          setAnimate(false);
          setIndex(display.length);
          window.requestAnimationFrame(() => {
            setAnimate(true);
            setIndex(display.length - 1);
          });
        });
        return i;
      }
      return i - 1;
    });
  }, [display.length]);

  useEffect(() => {
    if (paused || display.length < 2) return;
    const id = window.setInterval(next, STEP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, display.length, next]);

  useEffect(() => {
    if (index < display.length) return;
    const id = window.setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, STEP_TRANSITION_MS + 20);
    return () => window.clearTimeout(id);
  }, [index, display.length]);

  useEffect(() => {
    if (animate) return;
    const id = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(id);
  }, [animate]);

  return (
    <section className="py-14 md:py-20 overflow-hidden" data-testid="section-featured-products">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.15em] uppercase text-gray-900">
            {title}
          </h2>
          <div className="mx-auto mt-4 h-px w-12 bg-[#c4972a]" />
        </motion.div>
      </div>

      <div
        className="relative overflow-hidden group"
        data-testid="marquee-featured-products"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 bg-gradient-to-l from-white to-transparent z-10" />

        <button
          type="button"
          onClick={prev}
          aria-label="Previous product"
          data-testid="button-arrivals-prev"
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 md:h-12 md:w-12 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:text-[#c4972a] hover:border-[#c4972a]/40 hover:bg-white transition-colors opacity-80 hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next product"
          data-testid="button-arrivals-next"
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 md:h-12 md:w-12 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:text-[#c4972a] hover:border-[#c4972a]/40 hover:bg-white transition-colors opacity-80 hover:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="px-4 md:px-8">
          <div
            ref={trackRef}
            className="flex gap-5 md:gap-7 will-change-transform"
            style={{
              transform: `translate3d(${-index * stepPx}px, 0, 0)`,
              transition: animate
                ? `transform ${STEP_TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
                : "none",
            }}
          >
            {loop.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                ref={i === 0 ? itemRef : undefined}
                className="shrink-0 w-[68vw] sm:w-[44vw] md:w-[300px] lg:w-[320px]"
                aria-hidden={i >= display.length}
              >
                <ProductCard product={product} index={i % display.length} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
