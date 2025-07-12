import { Price } from "@/generated/prisma";
import { countryToCurrency } from "../../middleware";

export const formatPrice = (price: Price) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: price.currency,
  }).format(price.amount);
};

export const getProductCostWithCurrency = async (
  costs: Price[],
  user_country: string,
): Promise<Price> => {
  const currency = countryToCurrency[user_country];

  const regional_price = costs.find((cost) => {
    return cost.currency === currency;
  });

  return regional_price ?? { id: "", product_id: "", amount: -1, currency: "" };
};
