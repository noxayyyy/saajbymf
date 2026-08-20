import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Link } from "wouter";

export default function BrandStory() {
	const [email, setEmail] = useState("");

	return (
		<>
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
