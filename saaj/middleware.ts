import { NextRequest, NextResponse } from "next/server";

export const DEFAULT_COUNTRY = "PK";
export const supported_countries = ["PK", "US", "UK", "EU"];

export const countryToCurrency: { [key: string]: string } = {
  PK: "PKR",
  US: "USD",
  UK: "GBP",
  EU: "EUR",
};

async function getCountry(request: NextRequest) {
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for") ??
    "127.0.0.1";

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=countryCode`,
    );
    if (!response.ok) {
      return DEFAULT_COUNTRY;
    }

    const country_code = (await response.json()).countryCode;

    if (country_code && supported_countries.includes(country_code)) {
      return country_code;
    }
  } catch (err) {
    console.error("Failed to fetch GeoIP data for regional pricing:", err);
  }

  return DEFAULT_COUNTRY;
}

export async function middleware(request: NextRequest) {
  const country = await getCountry(request);

  const request_headers = new Headers(request.headers);
  request_headers.set("x-user-country", country);

  return NextResponse.next({
    request: {
      headers: request_headers,
    },
  });
}

export const config = {
  matcher: "/:path*",
};
