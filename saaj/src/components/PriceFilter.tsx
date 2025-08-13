"use client";

import ReactSlider from "react-slider";

interface PriceFilterProps {
	max_price: number;
	price_values: [number, number];
	currency: string;
	conversion_rate: number;
	onValuesChangeAction: (new_values: [number, number]) => void;
	className?: string;
}

export default function PriceFilter({ max_price, price_values, currency, conversion_rate, onValuesChangeAction: onValuesChange, className }: PriceFilterProps) {
	return (
		<div className="flex flex-col w-full pt-4">
			<ReactSlider
				className={`w-full ${className}`}
				thumbClassName="w-6 h-6 -top-2.5 bg-primary rounded-full cursor-grab focus:outline-none focus:ring-primary-focus"
				trackClassName="h-1 bg-base-300 rounded-full"
				min={0}
				max={max_price}
				value={price_values}
				ariaLabel={["lower", "higher"]}
				pearling
				minDistance={0}
				onChange={onValuesChange}
			/>
			<div className="flex justify-between w-full pt-5">
				<label className="badge border-black justify-start">
					{currency === "PKR" ? "Rs." : currency === "USD" ? "$" : currency === "GBP" ? "£" : "€"}
					<input
						type="number"
						min={0}
						max={max_price}
						value={price_values[0] * conversion_rate}
						onChange={(e) => onValuesChange([Math.max(0, parseFloat(e.target.value) / conversion_rate), price_values[1]])}
					/>
				</label>
				<label className="badge border-black justify-end">
					{currency === "PKR" ? "Rs." : currency === "USD" ? "$" : currency === "GBP" ? "£" : "€"}
					<input
						type="number"
						min={0}
						max={max_price}
						value={price_values[1] * conversion_rate}
						onChange={(e) => onValuesChange([price_values[0], Math.min(parseFloat(e.target.value) / conversion_rate, max_price)])}
					/>
				</label>
			</div>
		</div>
	);
}
