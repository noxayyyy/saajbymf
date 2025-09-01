import ProductDetails from "@/components/ProductDetails";
import ProductImageMagnifier from "@/components/ProductImageMagnifier";
import { getCurrency, getConversionRate } from "@/lib/currency";
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
			<div className="flex flex-col xl:flex-row items-center gap-12">

				{/* --- Left Column: Image Gallery --- */}
				<ProductImageMagnifier images={images} />
				<ProductDetails product={product} currency={currency} conversion_rate={conversion_rate} />

				{/* --- Right Column: Product Details --- */}
			</div>
		</div>
	);
}
