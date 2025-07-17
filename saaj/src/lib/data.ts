import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export const getTotalProductsCount = unstable_cache(
  () => prisma.product.count(),
  ["total_products_count"],
  {
    revalidate: 600,
  },
);
