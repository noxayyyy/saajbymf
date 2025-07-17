"use client";

import Link from "next/link";
import { JSX, useState, useTransition } from "react";

interface PaginationBarProps {
	current_page: number;
	total_pages: number;
	sort?: string;
}

export default function PaginationBar({ current_page, total_pages, sort }: PaginationBarProps) {
	const numbered_pages: JSX.Element[] = [];
	const [pending, startTransition] = useTransition();
	const [clicked, setClicked] = useState(0);

	for (let page = 1; page <= total_pages; page++) {
		numbered_pages.push(
			<Link
				href={`?page=${page}${sort ? `&sort=${sort}` : ""}`}
				key={page}
				className={`join-item btn btn-primary ${current_page === page ? "btn-active pointer-events-none" : ""}`}
				onClick={() => {
					setClicked(page);
					startTransition(() => { });
				}}
			>
				<div className="relative">
					{page}
					<div className="absolute inset-0 flex items-center justify-center">
						{(pending && clicked === page) && <span className="loading loading-spinner loading-md px-4" />}
					</div>
				</div>
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
					<Link href={`?page=${current_page - 1}${sort ? `&sort=${sort}` : ""}`} className="btn btn-primary join-item">
						«
					</Link>
				}
				<button className="btn btn-primary join-item pointer-events-none">Page {current_page}</button>
				{current_page < total_pages &&
					<Link href={`?page=${current_page + 1}${sort ? `&sort=${sort}` : ""}`} className="btn btn-primary join-item">
						»
					</Link>
				}
			</div>
		</div>
	)
}
