import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { Collection } from "@shared/schema";

export default function Collections() {
  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 py-12 md:py-16 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl md:text-4xl tracking-[0.15em] uppercase text-gray-900"
          >
            Collections
          </motion.h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {(collections || []).map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link href={`/collections/${collection.slug}`}>
                  <div className="group relative overflow-hidden cursor-pointer aspect-[3/4] bg-gray-100">
                    <img
                      src={collection.image || "/images/collection-embroidered.png"}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-center">
                      <div className="inline-block bg-white/90 backdrop-blur-sm px-6 md:px-8 py-2.5 md:py-3">
                        <h3 className="font-serif text-sm md:text-base tracking-[0.15em] uppercase text-gray-900">
                          {collection.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
