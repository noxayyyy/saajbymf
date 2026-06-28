import { motion } from "framer-motion";
import { Link } from "wouter";
import Seo from "@/components/Seo";

export default function About() {
	return (
		<div className="min-h-screen bg-white">
			<Seo
				title="About SAAJ by MF — Our Story & Heritage"
				description="Modernity in heritage. Learn about SAAJ by MF — a Pakistani luxury fashion house celebrating hand-craftsmanship and contemporary design."
				canonicalPath="/about"
			/>
			<div className="bg-gray-50 py-12 md:py-16 border-b border-gray-100">
				<div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-3 block">
							Our Story
						</span>
						<h1 className="font-serif text-3xl md:text-4xl tracking-[0.15em] uppercase text-gray-900">
							Modernity in Heritage
						</h1>
					</motion.div>
				</div>
			</div>

			<div className="max-w-[800px] mx-auto px-4 md:px-8 py-14 md:py-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center"
				>
					<h2 className="font-serif text-xl md:text-2xl tracking-wide text-gray-900">
						The Art of Pakistani Craftsmanship
					</h2>
					<p className="font-sans text-sm text-gray-600 leading-[1.8] mt-8">
						SAAJ by MF is a celebration of Pakistan's rich textile heritage, reimagined for the modern woman.
						Each piece in our collection is a testament to the extraordinary skill of our artisans,
						who bring centuries-old techniques into contemporary designs that speak to today's discerning fashion sensibility.
					</p>
					<p className="font-sans text-sm text-gray-600 leading-[1.8] mt-6">
						From the intricate Zardosi and Adda Work to the delicate Moti, Sitara, and Cut Dana embellishments,
						every stitch tells a story of dedication and artistry. Our fabrics are carefully selected - from luxurious
						Georgette and Silk Charmeuse to elegant Khaadi Net and Korean Raw Silk - ensuring that each ensemble
						drapes with grace and moves with effortless beauty.
					</p>
				</motion.div>
			</div>

			<div className="max-w-[1400px] mx-auto px-4 md:px-8">
				<div className="relative overflow-hidden h-[50vh] md:h-[60vh]">
					<img
						src="https://isnohirrymxtpfgmxsgp.supabase.co/storage/v1/object/public/saaj-uploads/heroImage1.jpeg"
						alt="SAAJ by MF Craftsmanship"
						className="w-full h-full object-cover"
						style={{ objectPosition: "center 45%" }}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
				</div>
			</div>

			<div className="max-w-[800px] mx-auto px-4 md:px-8 py-14 md:py-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center"
				>
					<h2 className="font-serif text-xl md:text-2xl tracking-wide text-gray-900">
						For Women Who Dress to Be Remembered
					</h2>
					<p className="font-sans text-sm text-gray-600 leading-[1.8] mt-8">
						Our philosophy is simple: create garments that make women feel extraordinary.
						Whether it's a formal gathering, a festive celebration, or a moment that calls for quiet elegance,
						SAAJ by MF offers pieces that transcend trends and become cherished additions to your wardrobe.
					</p>
					<div className="mt-10">
						<Link href="/shop">
							<span className="inline-block font-sans text-[11px] tracking-[0.25em] uppercase text-gray-900 border border-gray-400 px-10 py-4 transition-all duration-300 hover:bg-gray-900 hover:text-white cursor-pointer">
								Explore Collection
							</span>
						</Link>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
