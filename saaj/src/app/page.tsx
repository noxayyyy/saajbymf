import PaginationBar from "@/components/PaginationBar";
import ProductCard from "@/components/ProductCard";
import { DEFAULT_COUNTRY } from "../../middleware";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { countryToCurrency } from "../../middleware";
import { getTotalProductsCount } from "@/lib/data";
import SortSelect from "@/components/SortSelect";

interface HomeProps {
	searchParams: Promise<{ page: string, sort: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
	const awaited_params = await searchParams;
	const page = awaited_params.page || "1";
	const [sort_by, sort_ord] = awaited_params.sort?.split("-", 2) || ["id", "desc"];

	const user_country = (await headers()).get("x-user-country") || DEFAULT_COUNTRY;
	const currency = countryToCurrency[user_country];

	const current_page = parseInt(page);
	const page_size = 16;

	const hero_items = 1;
	const heroes = await prisma.product.findMany({
		orderBy: { id: "desc" },
		take: hero_items,
		include: {
			prices: {
				where: {
					currency: currency,
				},
			},
		},
	});

	const total_items = await getTotalProductsCount();
	const total_pages = Math.ceil((total_items - hero_items) / page_size);

	const product_ids = await prisma.product.findMany({
		orderBy: { [sort_by]: sort_ord },
		skip: (current_page - 1) * page_size,
		take: page_size,
		select: {
			id: true,
		},
	});

	let products = await prisma.product.findMany({
		where: {
			id: {
				in: product_ids.map(p => p.id),
			},
		},
		include: {
			prices: {
				where: { currency: currency },
			},
		},
		orderBy: { [sort_by]: sort_ord },
	});

	return (
		<div className="flex flex-col">
			{products.length &&
				<div className="hero rounded-xl bg-base-300">
					<div className="hero-content flex-col lg:flex-row">
						<Image
							src={heroes[0].image_urls[0]}
							alt={heroes[0].name}
							width={400}
							height={800}
							className="w-full max-w-sm rounded-lg shadow-2xl"
							priority
						/>

						<div>
							<h1 className="text-5xl font-bold">{heroes[0].name}</h1>
							<p className="py-6">{heroes[0].desc}</p>
							<Link
								href={`/products/${heroes[0].id}`}
								className="btn btn-secondary"
							>Check it out</Link>
						</div>
					</div>
				</div>
			}

			<div className="flex w-full justify-between mt-4">
				<div className="drawer justify-start">
					<input id="filter-drawer" type="checkbox" className="drawer-toggle" />
					<div className="drawer-content">
						{/* Page content here */}
						<label htmlFor="filter-drawer" className="btn btn-outline hover:btn-primary rounded-4xl">
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="py-2 h-full">
								<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
								<g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
								<g id="SVGRepo_iconCarrier">
									<path d="M21 6H19M21 12H16M21 18H16M7 20V13.5612C7 13.3532 7 13.2492 6.97958 13.1497C6.96147 13.0615 6.93151 12.9761 6.89052 12.8958C6.84431 12.8054 6.77934 12.7242 6.64939 12.5617L3.35061 8.43826C3.22066 8.27583 3.15569 8.19461 3.10948 8.10417C3.06849 8.02393 3.03853 7.93852 3.02042 7.85026C3 7.75078 3 7.64677 3 7.43875V5.6C3 5.03995 3 4.75992 3.10899 4.54601C3.20487 4.35785 3.35785 4.20487 3.54601 4.10899C3.75992 4 4.03995 4 4.6 4H13.4C13.9601 4 14.2401 4 14.454 4.10899C14.6422 4.20487 14.7951 4.35785 14.891 4.54601C15 4.75992 15 5.03995 15 5.6V7.43875C15 7.64677 15 7.75078 14.9796 7.85026C14.9615 7.93852 14.9315 8.02393 14.8905 8.10417C14.8443 8.19461 14.7793 8.27583 14.6494 8.43826L11.3506 12.5617C11.2207 12.7242 11.1557 12.8054 11.1095 12.8958C11.0685 12.9761 11.0385 13.0615 11.0204 13.1497C11 13.2492 11 13.3532 11 13.5612V17L7 20Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-darkreader-inline-stroke=""></path>
								</g>
							</svg>
							Filter
						</label>
					</div>
					<div className="drawer-side">
						<label htmlFor="filter-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
						<ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
							{/* Sidebar content here */}
							<li>Price</li>
							<li><a>Sidebar Item 2</a></li>
						</ul>
					</div>
				</div>
				<SortSelect sort={`${sort_by}-${sort_ord}`} current_page={current_page} className={"select-md font-semibold select-secondary rounded-4xl justify-end"} />
			</div>

			<div className="my-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				{products.map(product => (
					<ProductCard product={product} product_price={product.prices[0]} key={product.id} />
				))}
			</div>

			{total_pages > 1 && <PaginationBar current_page={current_page} total_pages={total_pages} sort={awaited_params.sort} />}
		</div>
	);
}
