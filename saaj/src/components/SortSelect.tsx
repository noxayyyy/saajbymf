"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface SortSelectProps {
	sort: string;
	className?: string;
}

export default function SortSelect({ sort, className }: SortSelectProps) {
	const router = useRouter();
	const pathname = usePathname();
	const search_params = useSearchParams();
	const params = new URLSearchParams(search_params.toString());

	return (
		<select
			className={`select focus:outline-hidden ${className}`}
			value={sort}
			onChange={(e) => {
				sort = e.target.value;
				params.set("sort", sort);
				router.push(`${pathname}?${params.toString()}`);
			}}
		>
			<option value="id-desc">Date: Latest</option>
			<option value="id-asc">Date: Oldest</option>
			<option value="name-asc">Name: A-Z</option>
			<option value="name-desc">Name: Z-A</option>
			<option value="price-asc">Price: Low to High</option>
			<option value="price-desc">Price: High to Low</option>
		</select>
	)
}
