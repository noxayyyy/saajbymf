import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SiInstagram, SiFacebook, SiYoutube, SiTiktok } from "react-icons/si";

export default function Footer() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  const instagramUrl = settings?.social_instagram || "https://instagram.com";
  const facebookUrl = settings?.social_facebook || "https://facebook.com";
  const youtubeUrl = settings?.social_youtube || "https://youtube.com";
  const tiktokUrl = settings?.social_tiktok || "https://tiktok.com";

  const quickLinks = [
    { label: "Track Order", href: "/track-order" },
    { label: "Size Chart", href: "/size-guide" },
    { label: "Lookbook", href: "/collections" },
    { label: "About us", href: "/about" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Shipping Policy", href: "/shipping-returns" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="py-8 md:py-10">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="font-sans text-xs md:text-sm text-gray-700 hover:text-black transition-colors cursor-pointer underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-5 mb-6">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-[#c4151c] transition-colors"
            >
              <SiFacebook className="w-4 h-4" />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-[#c4151c] transition-colors"
            >
              <SiInstagram className="w-4 h-4" />
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-[#c4151c] transition-colors"
            >
              <SiYoutube className="w-4 h-4" />
            </a>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-[#c4151c] transition-colors"
            >
              <SiTiktok className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200 py-4">
          <p className="font-sans text-[10px] tracking-[0.1em] text-gray-400 text-center">
            &copy; {new Date().getFullYear()} SAAJ by MF. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
