"use client";

import ProductCard from "./ProductCard";
import PaginationBar from "./PaginationBar";
import { Product } from "@/generated/prisma";
import { useState } from "react";

interface ProductGridProps {
	products: Product[];
	page_size: number;
	currency: string;
	conversion_rate: number;
}

export default function ProductGrid({ products, page_size, currency, conversion_rate }: ProductGridProps) {
	const total_pages = Math.ceil(products.length / page_size);
	const [page, setPage] = useState(1);

	return (
		<div className="flex flex-col">
			<div className="my-4 justify-items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" id="product-grid">
				{products.slice((page - 1) * page_size, page * page_size).map(product => (
					<ProductCard product={product} currency={currency} conversion_rate={conversion_rate} key={product.id} />
				))}
			</div>

			{total_pages > 1 && <PaginationBar current_page={page} total_pages={total_pages} onPageChangeAction={setPage} />}
		</div>
	);
}
