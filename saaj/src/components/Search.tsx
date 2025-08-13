import { redirect } from "next/navigation";

interface SearchProps {
	className?: string;
}

export default function Search({ className }: SearchProps) {
	async function handleSearch(form_data: FormData) {
		"use server";
		const query = form_data.get("search_query")?.toString();
		if (query) {
			redirect(`/search?=${query}`);
		}
	}

	return (
		<div className={`dropdown dropdown-start lg:dropdown-end ${className}`}>
			<div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
				<svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<g
						strokeLinejoin="round"
						strokeLinecap="round"
						strokeWidth="2.5"
						fill="none"
						stroke="currentColor"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.3-4.3"></path>
					</g>
				</svg>
			</div>
			<form action={handleSearch} className="dropdown-content rounded-box w-52 bg-base-100 z-1 p-2 shadow-sm">
				<div className="form-control">
					<label className="input rounded-lg focus:outline-hidden">
						<svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<g
								strokeLinejoin="round"
								strokeLinecap="round"
								strokeWidth="2.5"
								fill="none"
								stroke="currentColor"
							>
								<circle cx="11" cy="11" r="8"></circle>
								<path d="m21 21-4.3-4.3"></path>
							</g>
						</svg>
						<input type="search" required placeholder="Search" className="focus:outline-hidden" />
					</label>
				</div>
			</form>
		</div>
	);
}
