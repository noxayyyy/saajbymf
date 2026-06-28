import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Search, User, ShoppingBag, Heart, ChevronDown } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useCurrency, CURRENCIES } from "@/lib/currency";
import type { Collection } from "@shared/schema";


const navLinks = [
	{ label: "READY TO DELIVER", href: "/shop?filter=ready" },
	{ label: "SECRET GARDEN", href: "/collections/secret-garden" },
	{ label: "NEW ARRIVALS", href: "/shop?filter=new" },
	{ label: "MOST LOVED", href: "/shop?filter=featured" },
	{ label: "LUXURY PRET", href: "/collections/embroidered" },
	{ label: "FORMALS", href: "/collections/formal-wear" },
	{ label: "BRIDALS", href: "/collections/bridal" },
	{ label: "SAREES", href: "/collections/sarees" },
];

function isNavActive(location: string, search: string, href: string): boolean {
	const [path, query] = href.split("?");
	if (location !== path) return false;
	if (!query) return true;
	const hrefParams = new URLSearchParams(query);
	const currentParams = new URLSearchParams(search);
	for (const [key, value] of hrefParams.entries()) {
		if (currentParams.get(key) !== value) return false;
	}
	return true;
}

function navLinkClass(active: boolean) {
	if (active) {
		return "text-[#c4151c] border-b-2 border-[#c4151c] pb-0.5";
	}
	return "text-gray-700 hover:text-black";
}

export default function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [showBanner, setShowBanner] = useState(true);
	const [currencyOpen, setCurrencyOpen] = useState(false);
	const [mobileCurrencyOpen, setMobileCurrencyOpen] = useState(false);
	const { selectedCurrency, setSelectedCurrency } = useCurrency();
	const currencyRef = useRef<HTMLDivElement>(null);
	const mobileCurrencyRef = useRef<HTMLDivElement>(null);
	const [location, setLocation] = useLocation();
	const search = useSearch();

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (!currencyRef.current?.contains(e.target as Node)) setCurrencyOpen(false);
			if (!mobileCurrencyRef.current?.contains(e.target as Node)) setMobileCurrencyOpen(false);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		return () => { document.body.style.overflow = ""; };
	}, [mobileOpen]);

	const { user, isAdmin } = useAuth();
	const { itemCount, openCart } = useCart();

	const { data: settings } = useQuery<Record<string, string>>({
		queryKey: ["/api/settings/public"],
	});

	const { data: collections } = useQuery<Collection[]>({
		queryKey: ["/api/collections"],
	});

	const logoSrc = settings?.site_logo || "https://isnohirrymxtpfgmxsgp.supabase.co/storage/v1/object/public/saaj-uploads/logo.png";
	const whatsappRaw = settings?.site_whatsapp || settings?.site_phone || "+92-300-1775557";
	const whatsappDigits = whatsappRaw.replace(/\D/g, "");
	const whatsappLink = `https://wa.me/${whatsappDigits}`;
	const announcement = settings?.site_announcement || `CALL/WHATSAPP US AT ${whatsappRaw}`;

	const handleNavClick = (href: string) => {
		setMobileOpen(false);
		setLocation(href);
	};

	return (
		<>
			{/* ── Announcement bar ── */}
			{showBanner && (
				<div className="w-full bg-[#c4151c] text-white py-2 px-4 text-[10px] sm:text-[11px] tracking-[0.08em] sm:tracking-[0.1em] font-sans relative">
					<span className="flex items-center justify-center gap-2 pr-7">
						<SiWhatsapp className="w-3 h-3 shrink-0" />
						<span className="text-center leading-snug">{announcement}</span>
					</span>
					<button
						onClick={() => setShowBanner(false)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-1"
						aria-label="Dismiss"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			)}

			<header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
				<div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8">

					{/* ── Mobile / Tablet (< 1024px) ── */}
					<div className="lg:hidden relative flex items-center h-[56px] sm:h-[64px]">

						{/* Left: hamburger + currency */}
						<div className="flex items-center gap-1 shrink-0">
							<button
								onClick={() => setMobileOpen(true)}
								className="text-gray-800 hover:text-black p-1.5 -ml-1 shrink-0"
								aria-label="Open menu"
								data-testid="button-mobile-menu"
							>
								<Menu className="w-6 h-6" strokeWidth={1.5} />
							</button>

							{/* Currency picker — right of hamburger */}
							<div ref={mobileCurrencyRef} className="relative">
								<button
									onClick={() => setMobileCurrencyOpen(!mobileCurrencyOpen)}
									className="flex items-center border border-gray-300 rounded-sm px-1.5 py-1 text-[10px] tracking-wider text-gray-600 hover:border-gray-500 transition-colors"
									data-testid="button-currency-mobile"
								>
									{selectedCurrency.code}
									<ChevronDown className={`w-3 h-3 ml-0.5 transition-transform ${mobileCurrencyOpen ? "rotate-180" : ""}`} />
								</button>
								{mobileCurrencyOpen && (
									<div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-[200] min-w-[180px] py-1">
										{CURRENCIES.map((c) => (
											<button
												key={c.code}
												onClick={() => { setSelectedCurrency(c); setMobileCurrencyOpen(false); }}
												className={`w-full text-left px-4 py-2.5 text-[11px] tracking-wide hover:bg-gray-50 flex items-center justify-between transition-colors ${selectedCurrency.code === c.code ? "text-[#c4151c] font-semibold" : "text-gray-700"
													}`}
											>
												<span>{c.label}</span>
												<span className="text-gray-400 ml-2">{c.symbol}</span>
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Center: logo — absolutely centered horizontally AND vertically */}
						<Link href="/">
							<img
								src={logoSrc}
								alt="SAAJ by MF"
								className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-9 sm:h-11 w-auto max-w-[110px] sm:max-w-[140px] object-contain cursor-pointer"
							/>
						</Link>

						{/* Right: icons */}
						<div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
							<button
								onClick={() => setSearchOpen(!searchOpen)}
								className="p-1.5 text-gray-700 hover:text-black transition-colors"
								aria-label="Search"
								data-testid="button-search-mobile"
							>
								<Search className="w-[19px] h-[19px]" strokeWidth={1.5} />
							</button>
							<Link href={user ? (isAdmin ? "/admin" : "/account") : "/login"}>
								<span className="p-1.5 text-gray-700 hover:text-black cursor-pointer inline-flex items-center" data-testid="link-account-mobile">
									<User className="w-[19px] h-[19px]" strokeWidth={1.5} />
								</span>
							</Link>
							<button
								onClick={openCart}
								className="p-1.5 text-gray-700 hover:text-black transition-colors relative"
								aria-label="Open cart"
								data-testid="button-cart-mobile"
							>
								<ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.5} />
								{itemCount > 0 && (
									<span className="absolute -top-0.5 -right-0.5 w-[15px] h-[15px] rounded-full bg-[#c4151c] text-[9px] text-white flex items-center justify-center font-sans font-medium leading-none">
										{itemCount > 9 ? "9+" : itemCount}
									</span>
								)}
							</button>
						</div>
					</div>

					{/* ── Desktop (≥ 1024px) ── */}
					<div className="hidden lg:flex items-center gap-4 xl:gap-6 h-[70px] xl:h-[76px]">
						{/* Logo — fixed width */}
						<Link href="/">
							<img
								src={logoSrc}
								alt="SAAJ by MF"
								className="h-11 xl:h-12 w-auto object-contain shrink-0 cursor-pointer"
							/>
						</Link>

						{/* Nav — fills available space, centered */}
						<nav className="flex items-center justify-center flex-1 min-w-0 gap-x-3 xl:gap-x-5 2xl:gap-x-7 overflow-hidden">
							{navLinks.map((item) => {
								const active = isNavActive(location, search, item.href);
								return (
									<Link key={item.href} href={item.href}>
										<span
											className={`text-[10px] xl:text-[11px] 2xl:text-[12px] tracking-[0.08em] uppercase whitespace-nowrap font-medium cursor-pointer transition-colors leading-none ${navLinkClass(active)}`}
										>
											{item.label}
										</span>
									</Link>
								);
							})}
						</nav>

						{/* Right icons — fixed width */}
						<div className="flex items-center gap-0.5 xl:gap-1 shrink-0">
							{/* Currency */}
							<div ref={currencyRef} className="relative mr-1">
								<button
									onClick={() => setCurrencyOpen(!currencyOpen)}
									className="flex items-center border border-gray-300 rounded-sm px-2 py-1 text-[10px] xl:text-[11px] tracking-wider text-gray-600 hover:border-gray-500 transition-colors"
									data-testid="button-currency"
								>
									{selectedCurrency.code}
									<ChevronDown className={`w-3 h-3 ml-1 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
								</button>
								{currencyOpen && (
									<div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-[200] min-w-[180px] py-1">
										{CURRENCIES.map((c) => (
											<button
												key={c.code}
												onClick={() => { setSelectedCurrency(c); setCurrencyOpen(false); }}
												className={`w-full text-left px-4 py-2.5 text-[11px] tracking-wide hover:bg-gray-50 flex items-center justify-between transition-colors ${selectedCurrency.code === c.code ? "text-[#c4151c] font-semibold" : "text-gray-700"
													}`}
											>
												<span>{c.label}</span>
												<span className="text-gray-400 ml-2">{c.symbol}</span>
											</button>
										))}
									</div>
								)}
							</div>
							<a
								href={whatsappLink}
								target="_blank"
								rel="noopener noreferrer"
								className="p-1.5 text-gray-600 hover:text-[#25D366] transition-colors"
								title="WhatsApp"
							>
								<SiWhatsapp className="w-[17px] h-[17px]" />
							</a>
							<button
								onClick={() => setSearchOpen(!searchOpen)}
								className="p-1.5 text-gray-600 hover:text-black transition-colors"
								aria-label="Search"
							>
								<Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
							</button>
							<Link href={user ? (isAdmin ? "/admin" : "/account") : "/login"}>
								<span className="p-1.5 text-gray-600 hover:text-black cursor-pointer inline-flex items-center">
									<User className="w-[18px] h-[18px]" strokeWidth={1.5} />
								</span>
							</Link>
							<Link href="/shop">
								<span className="p-1.5 text-gray-600 hover:text-black cursor-pointer hidden xl:inline-flex xl:items-center">
									<Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
								</span>
							</Link>
							<button
								onClick={openCart}
								className="p-1.5 text-gray-600 hover:text-black transition-colors relative"
								aria-label="Open cart"
								data-testid="button-open-cart"
							>
								<ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
								{itemCount > 0 && (
									<span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#c4151c] text-[8px] text-white flex items-center justify-center font-sans font-medium leading-none">
										{itemCount > 9 ? "9+" : itemCount}
									</span>
								)}
							</button>
						</div>
					</div>
				</div>

				{/* ── Search bar ── */}
				{searchOpen && (
					<div className="border-t border-gray-100 py-3 px-4 bg-white">
						<div className="max-w-[600px] mx-auto relative">
							<input
								type="search"
								placeholder="Search our collections..."
								className="w-full border border-gray-300 px-4 py-2.5 pr-10 text-sm font-sans focus:outline-none focus:border-gray-500 transition-colors bg-transparent"
								autoFocus
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										const val = (e.target as HTMLInputElement).value.trim();
										if (val) {
											setSearchOpen(false);
											setLocation(`/shop?search=${encodeURIComponent(val)}`);
										}
									}
								}}
							/>
							<button
								onClick={() => setSearchOpen(false)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								aria-label="Close search"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}
			</header>

			{/* ── Mobile slide-out menu ── */}
			{mobileOpen && (
				<div className="fixed inset-0 z-[100]">
					<div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
					<div className="absolute left-0 top-0 bottom-0 w-[280px] sm:w-[320px] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
						<div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
							<img src={logoSrc} alt="SAAJ by MF" className="h-8 w-auto object-contain" />
							<button onClick={() => setMobileOpen(false)} className="p-1.5 text-gray-500 hover:text-black" aria-label="Close menu">
								<X className="w-5 h-5" />
							</button>
						</div>

						<nav className="py-1">
							{navLinks.map((item) => {
								const active = isNavActive(location, search, item.href);
								return (
									<button
										key={item.href}
										onClick={() => handleNavClick(item.href)}
										className={`w-full text-left px-5 py-3.5 border-b border-gray-50 text-xs tracking-[0.1em] uppercase font-medium transition-colors ${active
											? "text-[#c4151c] border-l-2 border-l-[#c4151c] bg-red-50/40"
											: "text-gray-800 hover:text-black"
											}`}
									>
										{item.label}
									</button>
								);
							})}

							{collections && collections.length > 0 && (
								<div className="border-t border-gray-200 mt-1 pt-1">
									<p className="px-5 pt-3 pb-1 text-[9px] tracking-[0.2em] text-gray-400 uppercase">Collections</p>
									{collections.map((col) => (
										<button
											key={col.id}
											onClick={() => handleNavClick(`/collections/${col.slug}`)}
											className="w-full text-left px-5 py-3.5 border-b border-gray-50 text-xs tracking-[0.1em] uppercase text-gray-700 hover:text-black font-medium"
										>
											{col.name}
										</button>
									))}
								</div>
							)}

							<div className="border-t border-gray-200 mt-1 pt-1">
								<button onClick={() => handleNavClick("/track-order")} className="w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase text-gray-700 hover:text-black font-medium">
									TRACK ORDER
								</button>
								<button onClick={() => handleNavClick("/size-guide")} className="w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase text-gray-700 hover:text-black font-medium">
									SIZE CHART
								</button>
								<button onClick={() => handleNavClick("/about")} className="w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase text-gray-700 hover:text-black font-medium">
									ABOUT US
								</button>
								<button onClick={() => handleNavClick("/contact")} className="w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase text-gray-700 hover:text-black font-medium">
									CONTACT
								</button>
								{user ? (
									<>
										<button onClick={() => handleNavClick("/account")} className="w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase text-gray-700 hover:text-black font-medium">
											MY ACCOUNT
										</button>
										{isAdmin && (
											<button onClick={() => handleNavClick("/admin")} className="w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase text-[#c4151c] font-medium">
												ADMIN PANEL
											</button>
										)}
									</>
								) : (
									<button onClick={() => handleNavClick("/login")} className="w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase text-gray-700 hover:text-black font-medium">
										SIGN IN
									</button>
								)}
							</div>

							<div className="border-t border-gray-200 mt-1 pt-4 px-5 pb-8">
								<a
									href={whatsappLink}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 text-gray-700 hover:text-[#25D366] transition-colors py-2"
								>
									<SiWhatsapp className="w-5 h-5 shrink-0" />
									<span className="font-sans text-xs">{whatsappRaw}</span>
								</a>
							</div>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
