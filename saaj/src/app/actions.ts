"use server";

import { cookies } from "next/headers";

export async function setCurrency(currency: string) {
  const supported_currencies = ["PKR", "USD", "GBP", "EUR"];
  if (!supported_currencies.includes(currency)) return;

  (await cookies()).set("currency", currency, {
    httpOnly: true,
    path: "/",
  });
}
