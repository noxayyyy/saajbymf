import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@shared/schema";

const defaultSlides = [
	{ image: "https://isnohirrymxtpfgmxsgp.supabase.co/storage/v1/object/public/saaj-uploads/heroImage1.jpeg", title: "Bridal", subtitle: "Couture", link: "/collections/bridal", cta: "SHOP NOW" },
	{ image: "https://isnohirrymxtpfgmxsgp.supabase.co/storage/v1/object/public/saaj-uploads/heroImage2.jpeg", title: "Formal", subtitle: "Wear", link: "/collections/formal-wear", cta: "EXPLORE" },
	{ image: "https://isnohirrymxtpfgmxsgp.supabase.co/storage/v1/object/public/saaj-uploads/heroImage3.jpeg", title: "Embroidered", subtitle: "Collection", link: "/collections/embroidered", cta: "DISCOVER" },
];

function preloadHeroImages(srcs: string[]) {
	if (typeof document === "undefined") return;
	srcs.forEach((src, i) => {
		if (!src || document.querySelector(`link[data-hero-preload="${i}"]`)) return;
		const link = document.createElement("link");
		link.rel = "preload";
		link.as = "image";
		link.href = src;
		link.dataset.heroPreload = String(i);
		document.head.appendChild(link);
	});
}

function ImageSlide({ src, alt, priority }: { src: string; alt: string; priority: boolean }) {
	const [loaded, setLoaded] = useState(false);
	return (
		<>
			{!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
			<img
				src={src}
				alt={alt}
				loading={priority ? "eager" : "lazy"}
				// @ts-expect-error fetchpriority is valid HTML
				fetchpriority={priority ? "high" : "auto"}
				decoding={priority ? "sync" : "async"}
				onLoad={() => setLoaded(true)}
				className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
				style={{ objectPosition: "center 45%" }}
				draggable={false}
			/>
		</>
	);
}

export default function HeroSection() {
	const [current, setCurrent] = useState(0);
	const [direction, setDirection] = useState(1);
	const [touchStartX, setTouchStartX] = useState<number | null>(null);
	const [touchStartY, setTouchStartY] = useState<number | null>(null);
	const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const [, navigate] = useLocation();

	const { data: banners = [] } = useQuery<Banner[]>({
		queryKey: ["/api/banners"],
	});

	const slides =
		banners.length > 0
			? banners.map((b) => ({
				image: b.image,
				title: b.title || "SAAJ",
				subtitle: b.subtitle || "",
				link: b.link || "/shop",
				cta: "SHOP NOW",
			}))
			: defaultSlides;

	useEffect(() => {
		preloadHeroImages(slides.map((s) => s.image));
	}, [slides.length]);

	const next = useCallback(() => {
		setDirection(1);
		setCurrent((prev) => (prev + 1) % slides.length);
	}, [slides.length]);

	const prev = useCallback(() => {
		setDirection(-1);
		setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
	}, [slides.length]);

	const goTo = useCallback(
		(idx: number) => {
			setDirection(idx > current ? 1 : -1);
			setCurrent(idx);
		},
		[current]
	);

	/* Auto-play: clear and restart timer on any navigation */
	const startAutoPlay = useCallback(() => {
		if (autoPlayRef.current) clearInterval(autoPlayRef.current);
		if (slides.length <= 1) return;
		autoPlayRef.current = setInterval(() => {
			setDirection(1);
			setCurrent((prev) => (prev + 1) % slides.length);
		}, 6000);
	}, [slides.length]);

	useEffect(() => {
		startAutoPlay();
		return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
	}, [startAutoPlay]);

	const handlePrev = (e: React.MouseEvent) => {
		e.stopPropagation();
		prev();
		startAutoPlay();
	};

	const handleNext = (e: React.MouseEvent) => {
		e.stopPropagation();
		next();
		startAutoPlay();
	};

	const handleDotClick = (e: React.MouseEvent, idx: number) => {
		e.stopPropagation();
		goTo(idx);
		startAutoPlay();
	};

	/* Touch / swipe support */
	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStartX(e.touches[0].clientX);
		setTouchStartY(e.touches[0].clientY);
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (touchStartX === null || touchStartY === null) return;
		const dx = touchStartX - e.changedTouches[0].clientX;
		const dy = touchStartY - e.changedTouches[0].clientY;
		if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
			// Horizontal swipe — change slide
			if (dx > 0) { next(); } else { prev(); }
			startAutoPlay();
		} else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
			// Tap (no movement) — navigate to slide link
			const currentSlide = slides[current] || slides[0];
			if (currentSlide?.link) navigate(currentSlide.link);
		}
		setTouchStartX(null);
		setTouchStartY(null);
	};

	useEffect(() => {
		if (current >= slides.length) setCurrent(0);
	}, [slides.length, current]);

	const slide = slides[current] || slides[0];

	return (
		<section className="relative w-full" aria-label="Hero banner">
			<div
				className="relative w-full h-[60vh] sm:h-[72vh] md:h-[88vh] overflow-hidden bg-gray-200 select-none"
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				{/* Slide image (not wrapped in Link to avoid interfering with arrow clicks) */}
				<AnimatePresence mode="wait" custom={direction}>
					<motion.div
						key={current}
						custom={direction}
						initial={{ opacity: 0, x: direction * 50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -direction * 50 }}
						transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
						className="absolute inset-0"
					>
						<div className="w-full h-full">
							<ImageSlide
								src={slide.image}
								alt={`${slide.title} ${slide.subtitle}`}
								priority={current === 0}
							/>
						</div>
					</motion.div>
				</AnimatePresence>

				{/* Dark gradient for text legibility */}
				<div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/10 to-transparent pointer-events-none" />

				{/* Text + CTA overlay — only the Link/button is interactive */}
				<div className="absolute inset-0 flex items-center justify-end px-5 sm:px-8 md:px-16 lg:px-24 pointer-events-none z-10">
					<AnimatePresence mode="wait">
						<motion.div
							key={`text-${current}`}
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -12 }}
							transition={{ duration: 0.7, delay: 0.2 }}
							className="text-right pointer-events-auto"
						>
							<h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-[86px] text-white font-light italic tracking-wide leading-[0.95] drop-shadow-sm">
								{slide.title}
							</h2>
							{slide.subtitle && (
								<h3 className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-[62px] text-white/90 font-light italic tracking-wide mt-1 md:mt-2 drop-shadow-sm">
									{slide.subtitle}
								</h3>
							)}
							<Link href={slide.link}>
								<span className="inline-block mt-5 md:mt-8 font-sans text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.28em] uppercase text-white font-medium cursor-pointer hover:opacity-75 transition-opacity border-b border-white/60 pb-0.5">
									{slide.cta}
								</span>
							</Link>
						</motion.div>
					</AnimatePresence>
				</div>

				{/* ── Arrow buttons ── */}
				{slides.length > 1 && (
					<>
						<button
							onClick={handlePrev}
							aria-label="Previous slide"
							className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/40 hover:bg-black/65 text-white rounded-full transition-all duration-200 shadow-lg"
						>
							<ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
						</button>
						<button
							onClick={handleNext}
							aria-label="Next slide"
							className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/40 hover:bg-black/65 text-white rounded-full transition-all duration-200 shadow-lg"
						>
							<ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
						</button>
					</>
				)}

				{/* ── Dot indicators ── */}
				{slides.length > 1 && (
					<div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-2.5">
						{slides.map((_, i) => (
							<button
								key={i}
								onClick={(e) => handleDotClick(e, i)}
								aria-label={`Go to slide ${i + 1}`}
								className={`rounded-full transition-all duration-300 ${i === current ? "bg-[#c4151c] w-5 h-2" : "bg-white/60 hover:bg-white w-2 h-2"
									}`}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
