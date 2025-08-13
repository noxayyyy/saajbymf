import ProductCard from "@/components/ProductCard";
import { getCurrency, getConversionRate } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

interface SearchPageProps {
	searchParams: Promise<{ query: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
	const query = (await searchParams).query;

	return {
		title: `Search: ${query} - Saaj by MF`,
	};
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const currency = await getCurrency();
	const conversion_rate = await getConversionRate(currency);

	const query = (await searchParams).query;

	const products = await prisma.product.findMany({
		where: { name: { contains: query, mode: "insensitive" } },
		orderBy: { id: "desc" },
	});

	if (products.length === 0) {
		return <div className="text-center">No products found.</div>
	}

	return (
		<div>
			{products.map(product => (
				<ProductCard product={product} currency={currency} conversion_rate={conversion_rate} key={product.id} />
			))}
		</div>
	);
}
