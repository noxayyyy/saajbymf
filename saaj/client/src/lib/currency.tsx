import { createContext, useContext, useState } from "react";

export type CurrencyCode = "PKR" | "USD" | "GBP" | "EUR" | "INR";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: "PKR", symbol: "Rs", label: "PKR - Pakistani Rupee" },
  { code: "USD", symbol: "$", label: "USD - US Dollar" },
  { code: "GBP", symbol: "£", label: "GBP - British Pound" },
  { code: "EUR", symbol: "€", label: "EUR - Euro" },
  { code: "INR", symbol: "₹", label: "INR - Indian Rupee" },
];

const RATES: Record<CurrencyCode, number> = {
  PKR: 1,
  USD: 1 / 279,
  GBP: 1 / 354,
  EUR: 1 / 300,
  INR: 83 / 279,
};

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (c: Currency) => void;
  formatPrice: (priceInPKR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);

  const formatPrice = (priceInPKR: number): string => {
    const rate = RATES[selectedCurrency.code];
    const converted = priceInPKR * rate;
    if (selectedCurrency.code === "PKR") {
      return `Rs ${Math.round(converted).toLocaleString("en-PK")}`;
    }
    if (selectedCurrency.code === "INR") {
      return `₹ ${Math.round(converted).toLocaleString("en-IN")}`;
    }
    return `${selectedCurrency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
