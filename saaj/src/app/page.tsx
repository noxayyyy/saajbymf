import { prisma } from "@/lib/prisma";
import { getMaxPrice } from "@/lib/data";
import SortSelect from "@/components/SortSelect";
import { getCurrency, getConversionRate } from "@/lib/currency";
import FilterDrawer from "@/components/FilterDrawer";
import ProductGrid from "@/components/ProductGrid";

interface HomeProps {
	searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
	const currency = await getCurrency();
	const conversion_rate = await getConversionRate(currency);

	const awaited_params = await searchParams;
	const sort = awaited_params.sort;
	const [sort_by, sort_ord] = sort?.split("-", 2) || ["id", "desc"];

	const price_min_overall = 0;
	const price_max_overall = Math.ceil(await getMaxPrice());
	const price_min = awaited_params.pmin ? parseInt(awaited_params.pmin) : price_min_overall;
	const price_max = awaited_params.pmax ? parseInt(awaited_params.pmax) : price_max_overall;

	const page_size = 16;

	const products = await prisma.product.findMany({
		where: {
			price: {
				gte: price_min,
				lte: price_max,
			},
		},
		orderBy: { [sort_by]: sort_ord },
	});

	return (
		<div className="flex flex-col" id="product-page">
			<div className="flex w-full justify-between mt-4">
				<FilterDrawer max_price={price_max_overall} currency={currency} conversion_rate={conversion_rate} className="justify-start" />
				<SortSelect sort={`${sort_by}-${sort_ord}`} className={"select-md font-semibold select-secondary rounded-4xl justify-end hover:bg-base-300 hover:select-primary transition ease-out duration-200"} />
			</div>
			<ProductGrid products={products} page_size={page_size} currency={currency} conversion_rate={conversion_rate} />
		</div>
	);
}
