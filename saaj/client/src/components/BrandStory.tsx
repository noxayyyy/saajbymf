import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Link } from "wouter";

export default function BrandStory() {
	const [email, setEmail] = useState("");

	return (
		<>
			<section className="relative w-full overflow-hidden">
				<Link
					href="/shop?filter=timeless-whites"
					className="relative block h-[70vh] md:h-[80vh] group"
					data-testid="link-timeless-whites"
					aria-label="Shop Timeless Whites"
				>
					<img
						src="https://isnohirrymxtpfgmxsgp.supabase.co/storage/v1/object/public/saaj-uploads/heroImage3.jpeg"
						alt="Timeless Whites Collection"
						className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
						style={{ objectPosition: "center 55%" }}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
					<div className="absolute bottom-10 md:bottom-16 left-0 right-0 text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<div className="inline-block bg-white/90 backdrop-blur-sm px-8 md:px-12 py-3 md:py-4 transition-colors group-hover:bg-white">
								<h3 className="font-serif text-sm md:text-base tracking-[0.2em] uppercase text-gray-900 transition-colors group-hover:text-[#c4972a]">
									TIMELESS WHITES
								</h3>
							</div>
						</motion.div>
					</div>
				</Link>
			</section>

			<section className="py-14 md:py-20 bg-white">
				<div className="max-w-[600px] mx-auto px-4 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<h3 className="font-serif text-2xl md:text-3xl tracking-[0.1em] uppercase text-gray-900 mb-3">
							SUBSCRIBE
						</h3>
						<p className="font-sans text-sm text-gray-600 mb-8">
							to our newsletter and receive updates
						</p>

						<div className="flex items-center border border-gray-300 max-w-[450px] mx-auto overflow-hidden">
							<div className="pl-3 text-gray-400 shrink-0">
								<Mail className="w-4 h-4" />
							</div>
							<input
								type="email"
								placeholder="Enter your email here..."
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="flex-1 min-w-0 px-3 py-3 text-sm font-sans bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-400"
							/>
							<button className="shrink-0 whitespace-nowrap px-4 sm:px-5 py-3 font-sans text-xs tracking-[0.15em] uppercase font-semibold text-gray-900 hover:text-[#c4151c] transition-colors border-l border-gray-300">
								SUBSCRIBE
							</button>
						</div>
					</motion.div>
				</div>
			</section>
		</>
	);
}
