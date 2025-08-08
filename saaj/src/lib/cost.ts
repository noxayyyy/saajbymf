import { prisma } from "./prisma";

export const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
  }).format(price);
};

export const getConversionRate = async (currency: string) => {
  return (
    (
      await prisma.currency.findFirst({
        where: {
          name: currency,
        },
      })
    )?.rate || 1
  );
};
