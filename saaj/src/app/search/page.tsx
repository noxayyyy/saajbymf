import ProductCard from "@/components/ProductCard";
import { DEFAULT_COUNTRY } from "../../../middleware";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { countryToCurrency } from "../../../middleware";
import { headers } from "next/headers";

interface SearchPageProps {
	searchParams: { query: string };
}

export function generateMetadata({ searchParams: { query } }: SearchPageProps): Metadata {
	return {
		title: `Search: ${query} - Saaj by MF`,
	};
}

export default async function SearchPage({ searchParams: { query } }: SearchPageProps) {
	const user_country = (await headers()).get("x-user-country") || DEFAULT_COUNTRY;
	const currency = countryToCurrency[user_country];

	const products = await prisma.product.findMany({
		where: { name: { contains: query, mode: "insensitive" } },
		include: { prices: { where: { currency: currency } } },
		orderBy: { id: "desc" },
	});

	if (products.length === 0) {
		return <div className="text-center">No products found.</div>
	}

	return (
		<div>
			{products.map(product => (
				<ProductCard product={product} product_price={product.prices[0]} key={product.id} />
			))}
		</div>
	);
}
