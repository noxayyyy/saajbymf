import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export const getTotalProductsCount = unstable_cache(
  () => prisma.product.count(),
  ["total_products_count"],
  {
    revalidate: 600,
  },
);
export const getMaxPrice = unstable_cache(
  async () =>
    (
      await prisma.product.findFirst({
        orderBy: {
          price: "desc",
        },
      })
    )?.price || 0,
  ["max_price"],
  {
    revalidate: 5,
  },
);

export const getQueriedProducts = async (query: string, take: number) => {
  return await prisma.product.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    orderBy: { id: "desc" },
    take: take,
  });
};
