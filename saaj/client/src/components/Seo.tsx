import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product";
  canonicalPath?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  noIndex?: boolean;
}

const SITE_NAME = "SAAJ by MF";
const SITE_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "https://saajbymf.mtai.live";

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function Seo({
  title,
  description,
  image,
  type = "website",
  canonicalPath,
  jsonLd,
  noIndex,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
      upsertMeta('meta[property="og:description"]', "property", "og:description", description);
      upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    }

    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);

    const path = canonicalPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const canonical = `${SITE_URL}${path}`;
    upsertLink("canonical", canonical);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonical);

    if (image) {
      const abs = image.startsWith("http") ? image : `${SITE_URL}${image}`;
      upsertMeta('meta[property="og:image"]', "property", "og:image", abs);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", abs);
      upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    }

    upsertMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    document.querySelectorAll('script[data-seo-jsonld="true"]').forEach((n) => n.remove());
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach((b) => {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.dataset.seoJsonld = "true";
        s.text = JSON.stringify(b);
        document.head.appendChild(s);
      });
    }
  }, [title, description, image, type, canonicalPath, noIndex, JSON.stringify(jsonLd)]);

  return null;
}
