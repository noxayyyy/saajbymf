import { prisma } from "@/lib/prisma";
import { getMaxPrice } from "@/lib/data";
import SortSelect from "@/components/SortSelect";
import { getCurrency, getConversionRate } from "@/lib/currency";
import FilterDrawer from "@/components/FilterDrawer";
import ProductGrid from "@/components/ProductGrid";
import LogoSvg from "@/components/LogoSVG";
import AutoScrollCarousel from "@/components/AutoScrollCarousel";

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
		<div className="mt-[-1rem]">
			<div className="relative">
				<div className="absolute top-0 w-full h-screen min-w-screen ml-[-50vw] mr-[-50vw] left-[50%] right-[50%] bg-black opacity-40 z-2 pointer-events-none"> </div>
				<div className="flex flex-col items-center justify-center absolute top-0 w-full h-screen min-w-screen ml-[-50vw] mr-[-50vw] left-[50%] right-[50%] opacity-90 z-3 pointer-events-none">
					<LogoSvg className="h-[30%]" />
					<p className="text-3xl lg:text-4xl text-[#d1ac66] font-serif pt-15">Modernity in Heritage</p>
				</div>
				<AutoScrollCarousel className="pointer-events-none w-full h-screen min-w-screen relative mx-[-50vw] left-[50%] right-[50%]" />
			</div>
			<div className="flex flex-col p-4" id="product-page">
				<div className="flex w-full justify-between mt-4">
					<FilterDrawer pmin={price_min} pmax={price_max} max_price={price_max_overall} currency={currency} conversion_rate={conversion_rate} className="justify-start" />
					<SortSelect sort={`${sort_by}-${sort_ord}`} className={"select-md font-semibold select-secondary rounded-4xl justify-end hover:bg-base-300 hover:select-primary transition ease-out duration-200"} />
				</div>
				<ProductGrid products={products} page_size={page_size} currency={currency} conversion_rate={conversion_rate} />
			</div>
		</div>
	);
}
