"use client";

import { redirect } from "next/navigation";

interface SortSelectProps {
	sort: string;
	current_page: number;
	className?: string;
}

export default function SortSelect({ sort, current_page, className }: SortSelectProps) {
	return (
		<select
			className={`select ${className}`}
			value={sort}
			onChange={(e) => {
				sort = e.target.value;
				redirect(`/?page=${current_page}&sort=${sort}`);
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
