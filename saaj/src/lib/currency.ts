import { cookies } from "next/headers";
import { prisma } from "./prisma";

const DEF_CURRENCY = "PKR";

export const getCurrency = async () => {
  return (await cookies()).get("currency")?.value || DEF_CURRENCY;
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
