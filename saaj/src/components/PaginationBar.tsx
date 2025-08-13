"use client";

import Link from "next/link";
import { JSX } from "react";

interface PaginationBarProps {
	current_page: number;
	total_pages: number;
	onPageChangeAction: (page: number) => void;
}

export default function PaginationBar({ current_page, total_pages, onPageChangeAction: onPageChange }: PaginationBarProps) {
	const numbered_pages: JSX.Element[] = [];

	for (let page = 1; page <= total_pages; page++) {
		numbered_pages.push(
			<Link
				href="#product-page"
				key={page}
				className={`join-item btn btn-primary ${current_page === page ? "btn-active pointer-events-none" : ""}`}
				onClick={() => {
					onPageChange(page);
				}}
			>
				{page}
			</Link>
		);
	}

	return (
		<div className="m-auto">
			<div className="join hidden sm:block">
				{numbered_pages}
			</div>
			<div className="join block sm:hidden">
				{current_page > 1 &&
					<button
						className="btn btn-primary join-item"
						onClick={() => {
							onPageChange(current_page - 1);
						}}
					>
						«
					</button>
				}
				<button className="btn btn-primary join-item pointer-events-none">Page {current_page}</button>
				{current_page < total_pages &&
					<button
						className="btn btn-primary join-item"
						onClick={() => {
							onPageChange(current_page + 1)
						}}
					>
						»
					</button>
				}
			</div>
		</div>
	)
}
