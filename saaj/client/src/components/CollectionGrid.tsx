import { Link } from "wouter";
import { motion } from "framer-motion";
import type { Collection } from "@shared/schema";

interface CollectionGridProps {
  collections: Collection[];
}

export default function CollectionGrid({ collections }: CollectionGridProps) {
  if (!collections.length) return null;

  return (
    <section className="py-10 md:py-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {collections.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link href={`/collections/${collection.slug}`}>
                <div className="group relative overflow-hidden cursor-pointer aspect-[4/5] md:aspect-[3/4] bg-gray-100">
                  <img
                    src={collection.image || "/images/collection-embroidered.png"}
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-center">
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
      </div>
    </section>
  );
}
