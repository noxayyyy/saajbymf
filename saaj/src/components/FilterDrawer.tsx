"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import PriceFilter from "./PriceFilter";

interface FilterDrawerProps {
	pmin: number;
	pmax: number
	max_price: number;
	currency: string;
	conversion_rate: number;
	className?: string;
}

export default function FilterDrawer({ pmin, pmax, max_price, currency, conversion_rate, className }: FilterDrawerProps) {
	const router = useRouter();
	const pathname = usePathname();
	const search_params = useSearchParams();
	const params = new URLSearchParams(search_params.toString());

	const [is_open, setOpen] = useState(false);
	const [price_values, setPriceValues]: [[number, number], Dispatch<SetStateAction<[number, number]>>] = useState([pmin, pmax]);

	const [pending, startTransition] = useTransition();

	function applyFilters() {
		startTransition(() => {
			params.set("pmin", price_values[0].toString());
			params.set("pmax", price_values[1].toString());
			router.push(`${pathname}?${params.toString()}`);
			setOpen(false);
		});
	}

	return (
		<div className={`drawer ${className}`}>
			<input
				id="filter-drawer"
				type="checkbox"
				className="drawer-toggle"
				checked={is_open}
				onChange={() => setOpen(!is_open)}
			/>
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
				<div className="flex flex-col h-screen w-85 text-base-content bg-base-100">
					<ul className="p-4 flex-1 overflow-y-auto">
						<li>Price</li>
						<li>
							<PriceFilter max_price={max_price} price_values={price_values} currency={currency} conversion_rate={conversion_rate} onValuesChangeAction={setPriceValues} />
						</li>
					</ul>
					<div className="text-lg">
						<div className="flex flex-col items-center pb-4">
							<button
								className="btn btn-primary rounded-lg sm:w-[150px]"
								onClick={applyFilters}
								disabled={pending}
							>
								{pending ? <span className="loading loading-spinner"></span> : "Apply"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div >
	);
}
