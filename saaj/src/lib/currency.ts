import { cookies } from "next/headers";

const DEF_CURRENCY = "PKR";

export const getCurrency = async () => {
  return (await cookies()).get("currency")?.value || DEF_CURRENCY;
};
