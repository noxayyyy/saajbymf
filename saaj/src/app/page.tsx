import PaginationBar from "@/components/PaginationBar";
import ProductCard from "@/components/ProductCard";
import { DEFAULT_COUNTRY } from "../../middleware";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { countryToCurrency } from "../../middleware";

interface HomeProps {
	searchParams: Promise<{ page: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
	const page = (await searchParams).page || "1";
	const user_country = (await headers()).get("x-user-country") || DEFAULT_COUNTRY;
	const currency = countryToCurrency[user_country];

	const current_page = parseInt(page);
	const page_size = 12;

	const hero_items = 1;
	const total_items = await prisma.product.count();
	const total_pages = Math.ceil((total_items - hero_items) / page_size);

	const products = await prisma.product.findMany({
		include: {
			prices: {
				where: { currency: currency },
			},
		},
		orderBy: { id: "desc" },
		skip: (current_page - 1) * page_size + (current_page === 1 ? 0 : hero_items),
		take: page_size + (current_page === 1 ? hero_items : 0),
	});

	return (
		<div className="flex flex-col">
			{current_page === 1 && products.length &&
				<div className="hero rounded-xl bg-base-300">
					<div className="hero-content flex-col lg:flex-row">
						<Image
							src={products[0].image_urls[0]}
							alt={products[0].name}
							width={400}
							height={800}
							className="w-full max-w-sm rounded-lg shadow-2xl"
							priority
						/>

						<div>
							<h1 className="text-5xl font-bold">{products[0].name}</h1>
							<p className="py-6">{products[0].desc}</p>
							<Link
								href={`/products/${products[0].id}`}
								className="btn btn-secondary"
							>Check it out</Link>
						</div>
					</div>
				</div>
			}

			<div className="my-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				{products.slice(current_page === 1 ? 1 : 0).map(product => (
					<ProductCard product={product} product_price={product.prices[0]} key={product.id} />
				))}
			</div>

			{total_pages > 1 && <PaginationBar current_page={current_page} total_pages={total_pages} />}
		</div>
	);
}
