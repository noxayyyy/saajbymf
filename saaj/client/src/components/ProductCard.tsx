import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import type { Product } from "@shared/schema";
import { useCurrency } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const { formatPrice } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={`/product/${product.slug}`}>
        <div className="group cursor-pointer">
          <div className="relative overflow-hidden aspect-[3/4] mb-3 bg-gray-100">
            {!imgError ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                <Package className="w-10 h-10 mb-2" />
                <span className="text-[10px] tracking-wider uppercase">No Image</span>
              </div>
            )}
            {!imgError && product.hoverImage && (
              <img
                src={product.hoverImage}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
            {product.isNew && (
              <div className="absolute top-3 right-3">
                <span className="bg-black text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 font-sans font-medium">
                  IMMEDIATE DELIVERY
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-center">
            <h3 className="font-serif text-sm md:text-[15px] tracking-wide text-gray-900 group-hover:text-[#c4151c] transition-colors">
              {product.name}
            </h3>
            {product.fabric && (
              <p className="font-sans text-[10px] tracking-[0.1em] uppercase text-gray-500">
                {product.fabric}
                {product.pieces && ` · ${product.pieces}`}
              </p>
            )}
            <p className="font-sans text-sm text-gray-800 font-medium">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
