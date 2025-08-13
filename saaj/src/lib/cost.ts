export const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
  }).format(price);
};
