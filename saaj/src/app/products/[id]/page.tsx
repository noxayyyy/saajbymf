import AddToCartButton from "@/components/AddToCartButton";
import CostTag from "@/components/CostTag";
import ProductImageMagnifier from "@/components/ProductImageMagnifier";
import { getConversionRate } from "@/lib/cost";
import { getCurrency } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

interface ProductPageProps {
	params: Promise<{
		id: string,
	}>
};

const getProduct = cache(async (id: string) => {
	const product = await prisma.product.findUnique({
		where: { id },
	});
	if (!product) notFound();
	return product;
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const id = (await params).id;

	const product = await getProduct(id);
	return {
		title: product.name + " - Saaj by MF",
		description: product.desc,
		openGraph: {
			images: [{ url: product.image_urls[0] }],
		},
	};
}

interface Image {
	id: number | string;
	src: string;
	alt: string;
}

export default async function ProductPage({ params }: ProductPageProps) {
	const id = (await params).id;
	const product = await getProduct(id);

	const currency = await getCurrency();
	const conversion_rate = await getConversionRate(currency);

	const images: Image[] = product.image_urls.map((url, index) => ({
		id: index,
		src: url,
		alt: `${product.name} - Image ${index + 1}`
	}));

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* THE MAIN LAYOUT GRID */}
			<div className="flex flex-col items-center gap-12">

				{/* --- Left Column: Image Gallery --- */}
				<ProductImageMagnifier images={images} />

				{/* --- Right Column: Product Details --- */}
				<div className="w-full text-center max-w-2xl space-y-4">
					{/* Product Name */}
					<h1 className="text-4xl font-extrabold tracking-tight text-base-content sm:text-5xl">
						{product.name}
					</h1>

					{/* SKU and Price */}
					<div className="flex justify-center items-center gap-4">
						<p className="text-sm text-base-content/70">SKU: {product.sku}</p>
						<div className="badge badge-accent badge-outline">In Stock</div>
					</div>

					<div>
						<CostTag price={product.price} currency={currency} conversion_rate={conversion_rate} className="text-3xl p-4" />
					</div>

					{/* Divider */}
					<div className="divider"></div>

					{/* Product Description */}
					<div>
						<h2 className="text-xl font-semibold text-base-content">Description</h2>
						<p className="text-base-content/80 mt-2">
							{product.desc}
						</p>
					</div>

					{/* Add to Cart Section */}
					{/* Constrain the button width for better aesthetics */}
					<div className="w-full max-w-sm mx-auto pt-4">
						<AddToCartButton product_id={product.id} />
					</div>
				</div>
			</div>
		</div>
	);
}
