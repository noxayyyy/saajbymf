import Link from "next/link";
import { JSX } from "react";

interface PaginationBarProps {
	current_page: number;
	total_pages: number;
}

export default function PaginationBar({ current_page, total_pages }: PaginationBarProps) {
	const numbered_pages: JSX.Element[] = [];

	for (let page = 1; page <= total_pages; page++) {
		numbered_pages.push(
			<Link
				href={`?page=${page}`}
				key={page}
				className={`join-item btn btn-primary ${current_page === page ? "btn-active pointer-events-none" : ""}`}
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
					<Link href={`?page=${current_page - 1}`} className="btn btn-primary join-item">
						«
					</Link>
				}
				<button className="btn btn-primary join-item pointer-events-none">Page {current_page}</button>
				{current_page < total_pages &&
					<Link href={`?page=${current_page + 1}`} className="btn btn-primary join-item">
						»
					</Link>
				}
			</div>
		</div>
	)
}
