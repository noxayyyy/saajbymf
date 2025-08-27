"use client";

import { Size, Stock } from "@/generated/prisma";

interface SizeRadioProps {
	default_size: Size;
	stock: Stock;
	onClickAction: (size: Size) => void
}

export default function SizeRadio({ default_size, stock, onClickAction: onClick }: SizeRadioProps) {
	return (
		<div>
			<input
				type="radio"
				id={`size-${stock.size}`}
				name={"size-radio"}
				defaultChecked={stock.size === default_size}
				onClick={() => onClick(stock.size)}
				className="sr-only peer"
				disabled={!stock.qty}
			/>
			<label
				htmlFor={`size-${stock.size}`}
				className="btn btn-primary border peer-not-checked:btn-ghost peer-not-checked:border-black hover:border-base-300 peer-checked:border-base-300 btn-circle peer-disabled:pointer-events-none peer-disabled:line-through">
				<span>{stock.size}</span>
			</label>
		</div>
	);
}
