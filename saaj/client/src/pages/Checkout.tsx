import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, X, Check, Truck, Landmark, CreditCard } from "lucide-react";
import { SiVisa, SiMastercard } from "react-icons/si";
import { LOCATIONS, getStatesForCountry, getCitiesForState } from "@/lib/locations";
import { useQuery } from "@tanstack/react-query";
import PhoneInput, { isValidPhoneNumber, type Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

function formatPrice(price: number, currency = "PKR"): string {
  const formatted = new Intl.NumberFormat("en-PK").format(price);
  const symbol = currency === "PKR" ? "Rs" : currency;
  return `${symbol} ${formatted}`;
}

const COUNTRIES = Object.keys(LOCATIONS);

const COUNTRY_TO_ISO: Record<string, Country> = {
  Pakistan: "PK",
  "United States": "US",
  "United Kingdom": "GB",
  "United Arab Emirates": "AE",
  "Saudi Arabia": "SA",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  India: "IN",
  Bangladesh: "BD",
  Kuwait: "KW",
  Qatar: "QA",
  Bahrain: "BH",
  Oman: "OM",
  Singapore: "SG",
  Malaysia: "MY",
};

const DEFAULT_BANK_DETAILS = {
  bankName: "Meezan Bank Limited",
  accountTitle: "SAAJ by MF",
  accountNumber: "0123-4567-8901-2345",
  iban: "PK36 MEZN 0001 2345 6789 0123",
  swift: "MEZNPKKA",
  branch: "Karachi, Pakistan",
};

type FormState = {
  email: string;
  newsOptIn: boolean;
  firstName: string;
  lastName: string;
  heightFeet: string;
  heightInch: string;
  phone: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  saveInfo: boolean;
};

type Errors = Partial<Record<keyof FormState, string>>;

const REQUIRED_LABELS: Partial<Record<keyof FormState, string>> = {
  email: "Email",
  firstName: "First name",
  lastName: "Last name",
  phone: "Phone number",
  address: "Address 1",
  country: "Country",
  city: "City",
};

function validate(form: FormState): Errors {
  const errs: Errors = {};
  (Object.keys(REQUIRED_LABELS) as Array<keyof FormState>).forEach((k) => {
    if (!String(form[k] ?? "").trim()) {
      errs[k] = `The ${REQUIRED_LABELS[k]} field is required.`;
    }
  });
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
    errs.email = "Please enter a valid email address.";
  }
  if (form.phone && !isValidPhoneNumber(form.phone)) {
    errs.phone = "Please enter a valid phone number for the selected country.";
  }
  return errs;
}

function inputClass(hasErr: boolean) {
  return [
    "w-full bg-gray-100 border outline-none px-4 py-3 font-sans text-[13px] text-gray-800 transition-colors",
    hasErr
      ? "border-red-500 bg-red-50 focus:border-red-500"
      : "border-transparent focus:border-gray-400 focus:bg-white",
  ].join(" ");
}

export default function Checkout() {
  const { items, total, clearCart, removeItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: siteSettings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings/public"] });
  const enabled = {
    card: siteSettings?.payoneer_enabled === "true",
    cod: (siteSettings?.cod_enabled ?? "true") !== "false",
    bank: (siteSettings?.bank_transfer_enabled ?? "true") !== "false",
    jazzcash: siteSettings?.jazzcash_enabled === "true",
    easypaisa: siteSettings?.easypaisa_enabled === "true",
  };
  const BANK_DETAILS = {
    bankName: siteSettings?.bank_name || DEFAULT_BANK_DETAILS.bankName,
    accountTitle: siteSettings?.bank_account_title || DEFAULT_BANK_DETAILS.accountTitle,
    accountNumber: siteSettings?.bank_account_number || DEFAULT_BANK_DETAILS.accountNumber,
    iban: siteSettings?.bank_iban || DEFAULT_BANK_DETAILS.iban,
    swift: DEFAULT_BANK_DETAILS.swift,
    branch: DEFAULT_BANK_DETAILS.branch,
  };
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [couponCode, setCouponCode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const [form, setForm] = useState<FormState>({
    email: "",
    newsOptIn: false,
    firstName: "",
    lastName: "",
    heightFeet: "",
    heightInch: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zip: "",
    saveInfo: false,
  });

  const [payment, setPayment] = useState<{ method: string; ref: string }>({
    method: "cod",
    ref: "",
  });

  useEffect(() => {
    if (!siteSettings) return;
    const order = ["cod", "bank", "card"] as const;
    const isOn = (m: string) => (enabled as any)[m];
    if (!isOn(payment.method)) {
      const first = order.find(isOn);
      if (first && first !== payment.method) setPayment({ method: first, ref: "" });
    }
  }, [siteSettings]);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState<{ number?: string; name?: string; expiry?: string; cvv?: string }>({});
  const [paymentScreenshot, setPaymentScreenshot] = useState<{ url: string; name: string } | null>(null);
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [screenshotError, setScreenshotError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeError, setAgreeError] = useState("");
  const SHIPPING_COST = 600;

  function luhnCheck(num: string): boolean {
    const digits = num.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }
  function formatCardNumber(v: string): string {
    return v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(v: string): string {
    const d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length < 3) return d;
    return d.slice(0, 2) + "/" + d.slice(2);
  }
  function validateCard() {
    const errs: typeof cardErrors = {};
    if (!luhnCheck(card.number)) errs.number = "Please enter a valid card number.";
    if (!card.name.trim() || card.name.trim().length < 2) errs.name = "Cardholder name is required.";
    const m = card.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!m) errs.expiry = "Use MM/YY.";
    else {
      const mm = parseInt(m[1], 10), yy = 2000 + parseInt(m[2], 10);
      const now = new Date();
      const exp = new Date(yy, mm, 0, 23, 59, 59);
      if (mm < 1 || mm > 12) errs.expiry = "Invalid month.";
      else if (exp < now) errs.expiry = "Card has expired.";
    }
    if (!/^\d{3,4}$/.test(card.cvv)) errs.cvv = "3 or 4 digits.";
    return errs;
  }

  useEffect(() => {
    if (user) {
      setForm((s) => ({
        ...s,
        email: s.email || user.email || "",
        firstName: s.firstName || user.firstName || "",
        lastName: s.lastName || user.lastName || "",
        address: s.address || (user as any).address || "",
        city: s.city || (user as any).city || "",
        country: s.country || (user as any).country || "Pakistan",
        phone: s.phone || user.phone || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (submitted) setErrors(validate(form));
  }, [form, submitted]);

  const currency = items[0]?.product.currency || "PKR";

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = document.querySelector<HTMLElement>(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    let blocked = false;
    setCardErrors({});
    setScreenshotError("");

    if (payment.method === "card") {
      const ce = validateCard();
      if (Object.keys(ce).length) { setCardErrors(ce); blocked = true; }
    } else if (payment.method === "bank") {
      if (!paymentScreenshot?.url) {
        setScreenshotError("Please upload a screenshot of your payment.");
        blocked = true;
      }
    }

    if (!agreeTerms) {
      setAgreeError("Please agree to the terms & conditions to continue.");
      blocked = true;
    } else {
      setAgreeError("");
    }
    if (blocked) {
      const firstErr = document.querySelector<HTMLElement>(".border-red-500 input, input.border-red-500");
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shippingEmail: form.email,
        shippingFirstName: form.firstName,
        shippingLastName: form.lastName,
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingState: form.state,
        shippingZip: form.zip,
        shippingCountry: form.country,
        shippingPhone: form.phone,
        paymentMethod: payment.method,
        paymentScreenshot: paymentScreenshot?.url ?? null,
        orderNotes,
      };
      const res = await apiRequest("POST", "/api/orders", orderData);
      const order = await res.json();
      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err: any) {
      toast({
        title: "Order failed",
        description: err?.message || "Could not place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-3">Your bag is empty</h2>
          <p className="font-sans text-sm text-gray-600 mb-6">
            Add a few pieces to your bag to continue to checkout.
          </p>
          <Link href="/shop">
            <a className="inline-block px-8 py-3 bg-gray-900 text-white text-[11px] tracking-[0.18em] uppercase font-sans hover:bg-gray-800 transition-colors">
              Continue Shopping
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const ErrorText = ({ name }: { name: keyof FormState }) =>
    errors[name] ? (
      <p className="mt-1.5 font-sans text-[12px] text-red-600" data-testid={`error-${name}`}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 lg:gap-16">
          {/* LEFT */}
          <div>
            {/* Stepper */}
            <nav className="flex items-center gap-2 font-sans text-[12px] mb-8">
              <button
                onClick={() => setStep(1)}
                className={`tracking-wide transition-colors ${step === 1 ? "text-gray-900 font-semibold" : "text-gray-400 hover:text-gray-700"}`}
                data-testid="step-customer"
              >
                Customer Information
              </button>
              <span className="text-gray-300">›</span>
              <span
                className={`tracking-wide ${step === 2 ? "text-gray-900 font-semibold" : "text-gray-400"}`}
                data-testid="step-shipping-payment"
              >
                Shipping &amp; Payment
              </span>
            </nav>

            {step === 1 && (
              <form onSubmit={handleContinue} className="space-y-6" noValidate>
                {/* Contact */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-sans text-[13px] font-bold tracking-[0.1em] uppercase text-gray-900">
                      Contact Information
                    </h3>
                    {!user && (
                      <p className="font-sans text-[12px] text-gray-500">
                        Already have an account?{" "}
                        <Link href="/login">
                          <a className="text-[#c4151c] hover:underline">Log In</a>
                        </Link>
                      </p>
                    )}
                  </div>
                  <input
                    type="email"
                    placeholder="Email:"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={inputClass(!!errors.email)}
                    data-testid="input-email"
                    data-field="email"
                  />
                  <ErrorText name="email" />
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.newsOptIn}
                      onChange={(e) => setField("newsOptIn", e.target.checked)}
                      className="w-3.5 h-3.5 accent-gray-900"
                    />
                    <span className="font-sans text-[12px] text-gray-700">
                      Keep me up to date on news and exclusive offers
                    </span>
                  </label>
                </div>

                {/* Shipping */}
                <div className="pt-2">
                  <h3 className="font-sans text-[13px] font-bold tracking-[0.1em] uppercase text-gray-900 mb-3">
                    Shipping Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                    <div>
                      <input
                        type="text"
                        placeholder="FirstName:"
                        value={form.firstName}
                        onChange={(e) => setField("firstName", e.target.value)}
                        className={inputClass(!!errors.firstName)}
                        data-testid="input-first-name"
                        data-field="firstName"
                      />
                      <ErrorText name="firstName" />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="LastName:"
                        value={form.lastName}
                        onChange={(e) => setField("lastName", e.target.value)}
                        className={inputClass(!!errors.lastName)}
                        data-testid="input-last-name"
                        data-field="lastName"
                      />
                      <ErrorText name="lastName" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr] gap-3 mt-4 items-center">
                    <label className="font-sans text-[13px] text-gray-700">Height</label>
                    <select
                      value={form.heightFeet}
                      onChange={(e) => setField("heightFeet", e.target.value)}
                      className="bg-gray-100 border border-transparent focus:border-gray-400 focus:bg-white outline-none px-3 py-3 font-sans text-[13px] text-gray-700"
                      data-testid="select-height-feet"
                    >
                      <option value="">Feet</option>
                      {[4, 5, 6].map((f) => (
                        <option key={f} value={f}>{f} ft</option>
                      ))}
                    </select>
                    <select
                      value={form.heightInch}
                      onChange={(e) => setField("heightInch", e.target.value)}
                      className="bg-gray-100 border border-transparent focus:border-gray-400 focus:bg-white outline-none px-3 py-3 font-sans text-[13px] text-gray-700"
                      data-testid="select-height-inch"
                    >
                      <option value="">Inch</option>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i}>{i} in</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <div
                      className={[
                        "saaj-phone-input w-full bg-gray-100 border px-4 py-3 font-sans text-[13px] text-gray-800 transition-colors",
                        errors.phone
                          ? "border-red-500 bg-red-50"
                          : "border-transparent focus-within:border-gray-400 focus-within:bg-white",
                      ].join(" ")}
                      data-field="phone"
                    >
                      <PhoneInput
                        international
                        defaultCountry={(COUNTRY_TO_ISO[form.country] || "PK") as Country}
                        country={COUNTRY_TO_ISO[form.country]}
                        value={form.phone || undefined}
                        onChange={(value) => setField("phone", value || "")}
                        placeholder="Phone number"
                        data-testid="input-phone"
                      />
                    </div>
                    <ErrorText name="phone" />
                  </div>

                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Address:"
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                      className={inputClass(!!errors.address)}
                      data-testid="input-address"
                      data-field="address"
                    />
                    <ErrorText name="address" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1 mt-4">
                    <div>
                      <select
                        value={form.country}
                        onChange={(e) => setForm((s) => ({ ...s, country: e.target.value, state: "", city: "" }))}
                        className={inputClass(!!errors.country) + " appearance-none"}
                        data-testid="select-country"
                        data-field="country"
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ErrorText name="country" />
                    </div>
                    <div>
                      <select
                        value={form.state}
                        onChange={(e) => setForm((s) => ({ ...s, state: e.target.value, city: "" }))}
                        disabled={!form.country || getStatesForCountry(form.country).length === 0}
                        className={inputClass(false) + " appearance-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"}
                        data-testid="select-state"
                      >
                        <option value="">{form.country ? "Select state / province" : "Select country first"}</option>
                        {getStatesForCountry(form.country).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={form.city}
                        onChange={(e) => setField("city", e.target.value)}
                        disabled={!form.state}
                        className={inputClass(!!errors.city) + " appearance-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"}
                        data-testid="select-city"
                        data-field="city"
                      >
                        <option value="">{form.state ? "Select city" : "Select state first"}</option>
                        {getCitiesForState(form.country, form.state).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ErrorText name="city" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="ZipPostalCode"
                      value={form.zip}
                      onChange={(e) => setField("zip", e.target.value)}
                      className={inputClass(false)}
                      data-testid="input-zip"
                    />
                  </div>

                  <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.saveInfo}
                      onChange={(e) => setField("saveInfo", e.target.checked)}
                      className="w-3.5 h-3.5 accent-gray-900"
                    />
                    <span className="font-sans text-[12px] text-gray-700">
                      Save this information for next time
                    </span>
                  </label>
                </div>

                <div className="flex justify-center sm:justify-end pt-4">
                  <button
                    type="submit"
                    className="px-20 py-4 bg-gray-800 text-white font-sans text-[13px] tracking-[0.3em] uppercase hover:bg-gray-900 transition-colors"
                    data-testid="button-continue"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Contact Information summary card */}
                <div className="border border-gray-200">
                  <div className="flex items-center justify-between px-5 py-4">
                    <h3 className="font-sans text-[13px] font-bold tracking-[0.1em] uppercase text-gray-900">
                      Contact Information
                    </h3>
                    <button
                      onClick={() => setStep(1)}
                      className="font-sans text-[11px] tracking-[0.18em] uppercase text-gray-700 hover:text-gray-900 flex items-center gap-1"
                      data-testid="button-edit-info"
                    >
                      Edit
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Shipping Method */}
                <div>
                  <h3 className="font-sans text-[13px] font-bold tracking-[0.1em] uppercase text-gray-900 mb-3">
                    Shipping Method
                  </h3>
                  <label className="border border-gray-300 px-5 py-4 flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked
                      readOnly
                      className="accent-[#c4151c] w-4 h-4"
                      data-testid="radio-shipping-ground"
                    />
                    <span className="flex-1 font-sans text-[13px] tracking-[0.06em] text-gray-900 font-medium">
                      GROUND <span className="text-gray-700">(RS {SHIPPING_COST})</span>
                    </span>
                    <Truck className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                  </label>
                </div>

                {/* Payment Method */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-sans text-[13px] font-bold tracking-[0.1em] uppercase text-gray-900">
                      Payment Method
                    </h3>
                    <p className="font-sans text-[12px] text-gray-500">
                      All transactions are secure and encrypted.
                    </p>
                  </div>

                  <div className="border border-gray-300 divide-y divide-gray-300">
                    {/* Card */}
                    {enabled.card && (
                    <label
                      className={`flex items-center gap-3 px-5 py-4 cursor-pointer ${payment.method === "card" ? "bg-gray-50" : ""}`}
                      data-testid="label-payment-card"
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment.method === "card"}
                        onChange={() => { setPayment({ method: "card", ref: "" }); setPaymentRefError(""); }}
                        className="accent-[#c4151c] w-4 h-4"
                      />
                      <span className="flex-1 font-sans text-[13px] tracking-[0.06em] text-gray-900 font-medium uppercase">
                        Debit / Credit Card
                      </span>
                      <span className="flex items-center gap-2">
                        <SiMastercard className="w-9 h-6 text-[#eb001b]" />
                        <SiVisa className="w-10 h-6 text-[#1a1f71]" />
                      </span>
                    </label>
                    )}
                    {enabled.card && payment.method === "card" && (
                      <div className="px-5 py-4 bg-white space-y-3">
                        <div>
                          <div className={`flex items-center gap-2 border ${cardErrors.number ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5`}>
                            <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-number"
                              placeholder="Card number"
                              value={card.number}
                              onChange={(e) => { setCard({ ...card, number: formatCardNumber(e.target.value) }); setCardErrors((x) => ({ ...x, number: undefined })); }}
                              className="flex-1 min-w-0 outline-none font-sans text-[13px] text-gray-800 placeholder:text-gray-400 bg-transparent"
                              data-testid="input-card-number"
                            />
                          </div>
                          {cardErrors.number && <p className="mt-1 font-sans text-[12px] text-red-600">{cardErrors.number}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            autoComplete="cc-name"
                            placeholder="Cardholder name"
                            value={card.name}
                            onChange={(e) => { setCard({ ...card, name: e.target.value }); setCardErrors((x) => ({ ...x, name: undefined })); }}
                            className={`w-full border ${cardErrors.name ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 outline-none font-sans text-[13px] text-gray-800 placeholder:text-gray-400`}
                            data-testid="input-card-name"
                          />
                          {cardErrors.name && <p className="mt-1 font-sans text-[12px] text-red-600">{cardErrors.name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-exp"
                              placeholder="MM/YY"
                              value={card.expiry}
                              onChange={(e) => { setCard({ ...card, expiry: formatExpiry(e.target.value) }); setCardErrors((x) => ({ ...x, expiry: undefined })); }}
                              className={`w-full border ${cardErrors.expiry ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 outline-none font-sans text-[13px] text-gray-800 placeholder:text-gray-400`}
                              data-testid="input-card-expiry"
                              maxLength={5}
                            />
                            {cardErrors.expiry && <p className="mt-1 font-sans text-[12px] text-red-600">{cardErrors.expiry}</p>}
                          </div>
                          <div>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              placeholder="CVV"
                              value={card.cvv}
                              onChange={(e) => { setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }); setCardErrors((x) => ({ ...x, cvv: undefined })); }}
                              className={`w-full border ${cardErrors.cvv ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 outline-none font-sans text-[13px] text-gray-800 placeholder:text-gray-400`}
                              data-testid="input-card-cvv"
                              maxLength={4}
                            />
                            {cardErrors.cvv && <p className="mt-1 font-sans text-[12px] text-red-600">{cardErrors.cvv}</p>}
                          </div>
                        </div>
                        <p className="font-sans text-[11px] text-gray-500 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-green-600" /> Your payment is secured with 256-bit SSL encryption.
                        </p>
                      </div>
                    )}

                    {/* COD */}
                    {enabled.cod && (
                    <label
                      className={`flex items-start gap-3 px-5 py-4 cursor-pointer ${payment.method === "cod" ? "bg-gray-50" : ""}`}
                      data-testid="label-payment-cod"
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment.method === "cod"}
                        onChange={() => { setPayment({ method: "cod", ref: "" }); setCardErrors({}); setBankErrors({}); }}
                        className="mt-1 accent-[#c4151c] w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-sans text-[13px] tracking-[0.06em] text-gray-900 font-medium uppercase">
                          Cash on Delivery
                        </p>
                        <p className="font-sans text-[12px] text-gray-500 mt-1">
                          Pay in cash when your order is delivered. Available within Pakistan.
                        </p>
                      </div>
                      <Truck className="w-7 h-7 text-gray-700" strokeWidth={1.5} />
                    </label>
                    )}
                    {enabled.cod && payment.method === "cod" && (
                      <div className="px-5 py-4 bg-white">
                        <p className="font-sans text-[12px] text-gray-600 leading-relaxed">
                          A representative will call to confirm your order before dispatch.
                          Please keep the exact amount of <span className="font-semibold text-gray-900">{formatPrice(total + SHIPPING_COST, currency)}</span> ready at the time of delivery.
                        </p>
                      </div>
                    )}

                    {/* Bank */}
                    {enabled.bank && (
                    <label
                      className={`flex items-start gap-3 px-5 py-4 cursor-pointer ${payment.method === "bank" ? "bg-gray-50" : ""}`}
                      data-testid="label-payment-bank"
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment.method === "bank"}
                        onChange={() => { setPayment({ method: "bank", ref: "" }); setCardErrors({}); }}
                        className="mt-1 accent-[#c4151c] w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-sans text-[13px] tracking-[0.06em] text-gray-900 font-medium uppercase">
                          Bank Transfer
                        </p>
                        <p className="font-sans text-[12px] text-gray-500 mt-1">
                          Transfer to our bank account &amp; enter the transaction reference
                        </p>
                      </div>
                      <Landmark className="w-7 h-7 text-gray-700" strokeWidth={1.5} />
                    </label>
                    )}
                    {enabled.bank && payment.method === "bank" && (
                      <div className="px-5 py-4 bg-white space-y-3">
                        <div className="bg-gray-50 border border-gray-200 p-4 font-sans text-[12px] text-gray-700 space-y-1">
                          <div className="grid grid-cols-[110px_1fr] gap-2"><span className="text-gray-500">Bank</span><span className="font-medium text-gray-900">{BANK_DETAILS.bankName}</span></div>
                          <div className="grid grid-cols-[110px_1fr] gap-2"><span className="text-gray-500">Account Title</span><span className="font-medium text-gray-900">{BANK_DETAILS.accountTitle}</span></div>
                          <div className="grid grid-cols-[110px_1fr] gap-2"><span className="text-gray-500">Account #</span><span className="font-medium text-gray-900 tracking-wider">{BANK_DETAILS.accountNumber}</span></div>
                          <div className="grid grid-cols-[110px_1fr] gap-2"><span className="text-gray-500">IBAN</span><span className="font-medium text-gray-900 tracking-wider">{BANK_DETAILS.iban}</span></div>
                          <div className="grid grid-cols-[110px_1fr] gap-2"><span className="text-gray-500">SWIFT</span><span className="font-medium text-gray-900">{BANK_DETAILS.swift}</span></div>
                          <div className="grid grid-cols-[110px_1fr] gap-2"><span className="text-gray-500">Branch</span><span className="font-medium text-gray-900">{BANK_DETAILS.branch}</span></div>
                          <p className="pt-2 text-[11px] text-gray-500">After transferring, upload your payment receipt / screenshot below for verification.</p>
                        </div>
                        <div>
                          <label
                            htmlFor="payment-screenshot-input"
                            className={`flex items-center justify-between gap-3 w-full border ${screenshotError ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2.5 cursor-pointer hover:border-gray-500 transition-colors`}
                            data-testid="label-payment-screenshot"
                          >
                            <span className="font-sans text-[13px] text-gray-700 truncate">
                              {screenshotUploading
                                ? "Uploading..."
                                : paymentScreenshot
                                  ? paymentScreenshot.name
                                  : "Upload payment screenshot (JPG/PNG)"}
                            </span>
                            <span className="font-sans text-[11px] tracking-[0.12em] uppercase text-gray-900 border border-gray-300 px-3 py-1 hover:bg-gray-50">
                              {paymentScreenshot ? "Change" : "Choose file"}
                            </span>
                          </label>
                          <input
                            id="payment-screenshot-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            data-testid="input-payment-screenshot"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              e.target.value = "";
                              if (!file) return;
                              if (file.size > 10 * 1024 * 1024) {
                                setScreenshotError("File is too large. Max 10MB.");
                                return;
                              }
                              setScreenshotError("");
                              setScreenshotUploading(true);
                              try {
                                const fd = new FormData();
                                fd.append("file", file);
                                const r = await fetch("/api/upload/payment-screenshot", { method: "POST", body: fd, credentials: "include" });
                                if (!r.ok) throw new Error("Upload failed");
                                const data = await r.json();
                                setPaymentScreenshot({ url: data.url, name: file.name });
                              } catch (err: any) {
                                setScreenshotError(err?.message || "Upload failed. Please try again.");
                              } finally {
                                setScreenshotUploading(false);
                              }
                            }}
                          />
                          {paymentScreenshot && (
                            <div className="mt-2 flex items-start gap-3">
                              <img
                                src={paymentScreenshot.url}
                                alt="Payment screenshot preview"
                                className="w-24 h-24 object-cover border border-gray-200"
                                data-testid="img-payment-screenshot-preview"
                              />
                              <button
                                type="button"
                                onClick={() => setPaymentScreenshot(null)}
                                className="font-sans text-[12px] text-gray-600 hover:text-red-600 underline"
                                data-testid="button-remove-screenshot"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                          {screenshotError && <p className="mt-1 font-sans text-[12px] text-red-600" data-testid="error-screenshot">{screenshotError}</p>}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Back + Terms + Confirm */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="font-sans text-[13px] text-gray-700 hover:text-gray-900 sm:pt-3"
                    data-testid="button-back-to-customer"
                  >
                    « Back
                  </button>
                  <div className="flex-1 max-w-sm sm:text-right">
                    <label className="flex items-start gap-2 cursor-pointer sm:justify-end">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => { setAgreeTerms(e.target.checked); if (e.target.checked) setAgreeError(""); }}
                        className="mt-0.5 w-3.5 h-3.5 accent-gray-900"
                        data-testid="checkbox-agree-terms"
                      />
                      <span className="font-sans text-[12px] text-gray-700">
                        I agree to the{" "}
                        <Link href="/shipping-returns"><a className="underline hover:text-gray-900">terms &amp; conditions</a></Link>
                        {" "}and the{" "}
                        <Link href="/shipping-returns"><a className="underline hover:text-gray-900">refund &amp; exchange policy</a></Link>.
                      </span>
                    </label>
                    {agreeError && (
                      <p className="mt-1.5 font-sans text-[12px] text-red-600 sm:text-right" data-testid="error-agree">{agreeError}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 font-sans text-[12px] text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Order Status: <span className="font-semibold text-amber-600">Waiting</span>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="mt-4 w-full sm:w-auto px-20 py-4 bg-gray-800 text-white font-sans text-[13px] tracking-[0.4em] uppercase hover:bg-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      data-testid="button-place-order"
                    >
                      {loading ? "Placing..." : "Place Order"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Discount */}
            <div className="mt-10 border border-gray-200 p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="font-sans text-[12px] tracking-[0.12em] uppercase text-gray-900 font-semibold sm:w-[140px]">
                <div>Discount Code</div>
                <div className="font-sans text-[11px] text-gray-500 normal-case tracking-normal mt-1">
                  Enter your coupon here
                </div>
              </div>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-gray-100 border border-transparent focus:border-gray-400 focus:bg-white outline-none px-3 py-2.5 font-sans text-[13px] text-gray-800"
                data-testid="input-coupon"
              />
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: couponCode ? "Invalid coupon" : "Enter a code",
                    description: couponCode
                      ? "No active discount matches this code."
                      : "Please type a coupon code first.",
                  })
                }
                className="px-5 py-2.5 bg-gray-900 text-white font-sans text-[11px] tracking-[0.18em] uppercase hover:bg-gray-800 transition-colors whitespace-nowrap"
                data-testid="button-apply-coupon"
              >
                Apply Coupon
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="lg:border-l lg:border-gray-200 lg:pl-10">
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Please mention the required information for all custom order, including size, design code, and requirements. Thanks."
              rows={4}
              className="w-full border border-gray-200 bg-white p-4 font-sans text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400 resize-none"
              data-testid="input-order-notes"
            />

            <ul className="mt-6 divide-y divide-gray-200">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex gap-4 py-4 first:pt-0 relative"
                  data-testid={`summary-item-${item.product.id}`}
                >
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="absolute top-3 right-0 w-5 h-5 rounded-full bg-[#d83a3a] hover:bg-red-700 flex items-center justify-center text-white transition-colors"
                    aria-label="Remove item"
                    data-testid={`button-summary-remove-${item.product.id}`}
                  >
                    <X className="w-3 h-3" strokeWidth={3} />
                  </button>
                  <Link href={`/product/${item.product.slug}`}>
                    <a className="shrink-0 w-[88px] h-[110px] bg-gray-50 overflow-hidden block">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </a>
                  </Link>
                  <div className="flex-1 min-w-0 pr-7">
                    <Link href={`/product/${item.product.slug}`}>
                      <a className="font-serif text-[16px] text-gray-900 hover:text-[#c4151c] leading-tight block">
                        {item.product.name}
                      </a>
                    </Link>
                    <p className="font-sans text-[12px] text-gray-500 mt-1">
                      {item.product.sku || `SAAJ-${item.product.id.slice(-6).toUpperCase()}`}
                    </p>
                    <p className="font-sans text-[12px] text-gray-500">Size: {(item as any).size || "XS"}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          data-testid={`button-summary-dec-${item.product.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[28px] text-center font-sans text-[12px] text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          data-testid={`button-summary-inc-${item.product.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-sans text-[14px] text-gray-900">
                        {formatPrice(item.product.price * item.quantity, item.product.currency)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-200 mt-2 pt-5 space-y-3 font-sans text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <span className="tracking-[0.1em] uppercase text-gray-700 font-semibold shrink-0">Sub-Total:</span>
                <span className="text-gray-900 text-right" data-testid="text-checkout-subtotal">
                  {formatPrice(total, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="tracking-[0.1em] uppercase text-gray-700 font-semibold shrink-0">Shipping:</span>
                <span className="text-gray-900 text-right" data-testid="text-checkout-shipping">
                  {step === 2 ? formatPrice(SHIPPING_COST, currency) : "Calculated at checkout"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-200">
                <span className="tracking-[0.1em] uppercase text-gray-900 font-semibold shrink-0">Total:</span>
                <span className="text-gray-900 font-semibold text-right" data-testid="text-checkout-total">
                  {step === 2
                    ? formatPrice(total + SHIPPING_COST, currency)
                    : <span className="tracking-wider text-[12px] uppercase">Calculated at checkout</span>}
                </span>
              </div>
            </div>

            {step === 2 && (
              <div className="mt-5 flex items-center gap-2 text-[12px] font-sans text-gray-500">
                <Check className="w-3.5 h-3.5 text-green-600" />
                Your information is secure and encrypted.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
